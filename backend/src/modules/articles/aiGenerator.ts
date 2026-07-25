// AI Generator - Gemini & Xieqa provider support
import { AppError } from '../../middleware/errorHandler';

interface ScrapedData {
  title: string;
  author: string;
  media: string;
  date: string;
  url: string;
  body: string;
}

export interface GeneratedArticle {
  seoTitle: string;
  lead: string;
  content: string;
  slug: string;
  metaDescription: string;
  focusKeyword: string;
  category: string;
  tags: string[];
}

/**
 * Validates whether a string is a valid URL
 */
export function validateUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Scrapes news details and clean main article body from a HTML string
 */
export function scrapeHtml(html: string, url: string): ScrapedData {
  // Extract Title
  let title = '';
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
                       html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i);
  if (ogTitleMatch) {
    title = ogTitleMatch[1];
  } else {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    title = titleMatch ? titleMatch[1].trim() : '';
  }
  // clean title from site suffix
  title = title.split(' - ')[0].split(' | ')[0].split(' – ')[0].trim();

  // Extract Author
  let author = '';
  const authorMatch = html.match(/<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i) ||
                      html.match(/<meta\s+property=["']article:author["']\s+content=["']([^"']+)["']/i) ||
                      html.match(/<meta\s+name=["']twitter:creator["']\s+content=["']([^"']+)["']/i);
  if (authorMatch) {
    author = authorMatch[1].trim();
  }

  // Extract Media/Publisher
  let media = '';
  const siteNameMatch = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i) ||
                        html.match(/<meta\s+name=["']twitter:site["']\s+content=["']([^"']+)["']/i);
  if (siteNameMatch) {
    media = siteNameMatch[1].trim();
  } else {
    try {
      const urlObj = new URL(url);
      media = urlObj.hostname.replace('www.', '');
    } catch {}
  }

  // Extract Date
  let date = '';
  const dateMatch = html.match(/<meta\s+property=["']article:published_time["']\s+content=["']([^"']+)["']/i) ||
                    html.match(/<meta\s+name=["']publish-date["']\s+content=["']([^"']+)["']/i) ||
                    html.match(/<meta\s+name=["']pubdate["']\s+content=["']([^"']+)["']/i) ||
                    html.match(/<meta\s+property=["']og:release_date["']\s+content=["']([^"']+)["']/i);
  if (dateMatch) {
    date = dateMatch[1].trim();
  }

  // Clean HTML body
  let bodyHtml = html;
  bodyHtml = bodyHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  bodyHtml = bodyHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  bodyHtml = bodyHtml.replace(/<!--[\s\S]*?-->/g, '');

  // Strip headers, footers, navs, aside element blocks
  bodyHtml = bodyHtml.replace(/<(header|footer|nav|aside|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '');
  
  // Strip widgets, ads, comment sections, related post boxes
  const noiseRegex = /<div[^>]*(id|class)=["'][^"']*(ads|widget|footer|header|related|popup|nav|menu|comment|sidebar)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi;
  for (let i = 0; i < 3; i++) {
    bodyHtml = bodyHtml.replace(noiseRegex, '');
  }

  // Extract headings and paragraphs
  const paragraphMatches = bodyHtml.match(/<(p|h1|h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi) || [];
  const textBlocks: string[] = [];

  for (const match of paragraphMatches) {
    const tagType = match.match(/^<([a-z1-6]+)/i)?.[1]?.toLowerCase() || 'p';
    let content = match.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    
    content = content
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');

    if (content.length > 20) {
      if (tagType.startsWith('h')) {
        textBlocks.push(`\n${content}\n`);
      } else {
        textBlocks.push(content);
      }
    }
  }

  const articleBody = textBlocks.join('\n\n').trim();

  return {
    title,
    author,
    media,
    date,
    url,
    body: articleBody
  };
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

function cleanArticleObject(article: GeneratedArticle): GeneratedArticle {
  return {
    seoTitle: cleanTextField(article.seoTitle),
    lead: cleanTextField(article.lead),
    content: cleanHtmlNewlines(article.content),
    slug: cleanTextField(article.slug),
    metaDescription: cleanTextField(article.metaDescription),
    focusKeyword: cleanTextField(article.focusKeyword),
    category: cleanTextField(article.category),
    tags: Array.isArray(article.tags) ? article.tags.map(cleanTextField) : [],
  };
}

function autoRepairTruncatedJson(text: string): string {
  let trimmed = text.trim();
  
  if (trimmed.endsWith('}')) {
    return trimmed;
  }
  
  console.log('[AI:Repair] Mendeteksi JSON terpotong, mencoba memperbaiki...');
  
  const contentIndex = trimmed.indexOf('"content"');
  if (contentIndex !== -1) {
    const matchSeoTitle = trimmed.match(/"seoTitle"\s*:\s*"([^"]+)"/);
    const matchLead = trimmed.match(/"lead"\s*:\s*"([^"]+)"/);
    const matchContent = trimmed.match(/"content"\s*:\s*"([^"]*)$/);
    
    const seoTitle = matchSeoTitle ? matchSeoTitle[1] : "Judul Berita Auto";
    const lead = matchLead ? matchLead[1] : "Ringkasan berita auto.";
    let content = "";
    
    if (matchContent) {
      content = matchContent[1];
    } else {
      const parts = trimmed.split(/"content"\s*:\s*"/);
      if (parts.length > 1) {
        content = parts[1];
      }
    }
    
    content = content.replace(/<[^>]*$/, ''); // hapus tag HTML menggantung di akhir
    content += " ... (konten terpotong oleh server Xieqa)";
    
    const repairedJson = {
      seoTitle: seoTitle,
      lead: lead,
      content: content,
      slug: seoTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'),
      metaDescription: lead.substring(0, 150),
      focusKeyword: seoTitle.split(' ').slice(0, 3).join(' '),
      category: "Politik",
      tags: ["Poros Madura", "Berita Utama"]
    };
    
    return JSON.stringify(repairedJson);
  }
  
  return trimmed + '\n, "content": "Konten terpotong", "slug": "auto-slug", "metaDescription": "auto", "focusKeyword": "auto", "category": "Politik", "tags": [] }';
}

/**
 * Robust JSON parser that handles common issues from AI outputs
 */
function robustJsonParse(text: string): GeneratedArticle {
  const repairedText = autoRepairTruncatedJson(text);

  // First attempt: direct parse
  try {
    return cleanArticleObject(JSON.parse(repairedText) as GeneratedArticle);
  } catch {
    // Second attempt: fix unescaped quotes inside string values by using regex
    // to find and escape double quotes within HTML content
    try {
      // Replace any unescaped double quotes within HTML attributes (e.g., attr="value")
      const fixedText = text
        // fix HTML attributes with double quotes: replace ="value" with =\"value\"
        .replace(/=\"([^"]*)\"/g, '=&quot;$1&quot;')
        // also fix any remaining unescaped quotes that break JSON
        .replace(/([^\\])"([^,:{}\[\]]+)"(?=[^:,{}\[\]]*[<>])/g, '$1\\"$2\\"');
      return cleanArticleObject(JSON.parse(fixedText) as GeneratedArticle);
    } catch {
      // Third attempt: extract fields manually using regex
      const extractField = (field: string): string => {
        const match = text.match(new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 's'));
        return match ? match[1] : '';
      };
      
      const seoTitle = extractField('seoTitle');
      const lead = extractField('lead');
      const slug = extractField('slug');
      const metaDescription = extractField('metaDescription');
      const focusKeyword = extractField('focusKeyword');
      const category = extractField('category');
      
      // Extract content (may be very long)
      const contentMatch = text.match(/"content"\s*:\s*"((?:[^"\\]|\\[\s\S])*)"/s);
      const content = contentMatch ? contentMatch[1] : '';
      
      // Extract tags array
      const tagsMatch = text.match(/"tags"\s*:\s*\[([^\]]+)\]/);
      const tags: string[] = [];
      if (tagsMatch) {
        const tagItems = tagsMatch[1].match(/"([^"]+)"/g) || [];
        tags.push(...tagItems.map(t => t.replace(/"/g, '')));
      }
      
      const rawArticle = { seoTitle, lead, content, slug, metaDescription, focusKeyword, category, tags };
      return cleanArticleObject(rawArticle);
    }
  }
}

function cleanHtmlNewlines(html: string): string {
  if (!html) return html;
  return html
    .replace(/\\n/g, '') // Hapus literal \n (backslash + n)
    .replace(/\r?\n/g, '') // Hapus raw newline characters agar editor HTML bersih
    .replace(/\s+/g, ' ') // Rapikan spasi ganda
    .trim();
}

function cleanTextField(text: string): string {
  if (!text) return text;
  return text
    .replace(/\\n/g, ' ') // Ganti literal \n dengan spasi
    .replace(/\r?\n/g, ' ') // Ganti raw newline dengan spasi
    .replace(/\s+/g, ' ') // Rapikan spasi ganda
    .trim();
}
function buildPrompt(scrapedData: ScrapedData, provider: 'gemini' | 'xieqa' = 'gemini'): { systemPrompt: string; userContent: string } {
  const isXieqa = provider === 'xieqa';
  const targetWordsText = isXieqa 
    ? 'Panjang isi artikel (tidak termasuk judul, lead terpisah, slug, dsb) WAJIB memiliki panjang antara 300 hingga 450 kata. Kembangkan isi berita secara alami dengan tetap berpedoman pada fakta yang tersedia.'
    : 'Panjang isi artikel (tidak termasuk judul, lead terpisah, slug, dsb) WAJIB memiliki panjang antara 800 hingga 1.300 kata. Target ideal: 900–1.100 kata. Artikel tidak boleh dipersingkat hanya karena artikel sumber pendek. Kembangkan isi berita secara alami dengan tetap berpedoman pada fakta yang tersedia.';

  const contentSchemaText = isXieqa
    ? 'string (Isi artikel lengkap menggunakan format tag HTML. Gunakan tag <h2> untuk judul bagian/headings seperti <h2>Kronologi Kejadian</h2>, <h2>Fakta Penting</h2>, dan tag <p> untuk paragraf. Ingat, total kata dalam tag-tag <p> di content ini wajib berkisar antara 300 s.d 450 kata!)'
    : 'string (Isi artikel lengkap menggunakan format tag HTML. Gunakan tag <h2> untuk judul bagian/headings seperti <h2>Kronologi Kejadian</h2>, <h2>Fakta Penting</h2>, dan tag <p> untuk paragraf. Ingat, total kata dalam tag-tag <p> di content ini wajib berkisar antara 800 s.d 1300 kata!)';

  const systemPrompt = `
Anda adalah Editor Senior Portal Berita Nasional, SEO News Writer, dan Wartawan Profesional.

Tugas Anda bukan melakukan paraphrase.
Tugas Anda adalah membaca artikel sumber, memahami seluruh fakta di dalamnya, kemudian melupakan struktur artikel tersebut.

Ambil hanya:
- fakta
- kronologi
- tokoh
- lokasi
- tanggal
- angka
- kutipan
- data resmi

Setelah itu tulislah artikel berita baru dari nol.

Aturan:
- jangan menyalin kalimat
- jangan mempertahankan struktur artikel asli
- jangan melakukan rewrite kalimat demi kalimat
- jangan menggunakan sinonim setiap kalimat

Bayangkan Anda baru saja menghadiri konferensi pers yang sama dan sekarang menulis berita versi media Anda sendiri.
Gunakan bahasa jurnalistik Indonesia yang profesional.
Gunakan gaya penulisan khas media nasional.

Artikel harus:
- original
- natural
- mudah dibaca
- informatif
- SEO Friendly

Gunakan struktur isi artikel dengan MINIMAL 4 subjudul H2:
- Lead (1 paragraf, ringkas, langsung menjelaskan inti berita — tulis sebagai <p> pertama sebelum H2 pertama)
- <h2>Kronologi Kejadian</h2>
- <h2>Fakta Penting</h2>
- <h2>Pernyataan Resmi</h2>
- <h2>Dampak dan Konteks</h2> (atau subjudul relevan lainnya)
- <h2>Penutup</h2>
Gunakan <h3> jika diperlukan untuk mengelompokkan sub-informasi di bawah H2.

# PANJANG ARTIKEL — ATURAN WAJIB

Artikel yang dihasilkan WAJIB memiliki panjang antara 800 hingga 1.300 kata.
Target ideal: 900–1.100 kata.

Artikel TIDAK BOLEH dipersingkat hanya karena artikel sumber pendek.
Jika informasi sumber tidak cukup untuk mencapai 800 kata, kembangkan isi hanya dengan cara berikut:
- memperjelas kronologi kejadian
- menjelaskan latar belakang peristiwa berdasarkan informasi yang ada
- menguraikan pernyataan narasumber secara lebih lengkap
- memperjelas konteks kejadian
- menjelaskan dampak atau implikasi yang didukung oleh fakta
- menyusun transisi antarbagian agar alur berita lebih nyaman dibaca

AI DILARANG KERAS:
- menambahkan fakta baru
- membuat asumsi
- membuat opini pribadi
- mengarang kutipan
- mengubah data, angka, nama, lokasi, atau kronologi

Aturan Paragraf:
- Maksimal 3 kalimat per paragraf, paragraf pendek dan jelas.
- Pastikan keyword utama muncul secara natural.
- ${targetWordsText}
- Artikel harus terasa natural, informatif, dan nyaman dibaca — bukan bertele-tele hanya untuk mengejar jumlah kata.

Pilih Kategori yang paling sesuai dari daftar kategori berikut saja:
Bangkalan, Sampang, Pamekasan, Sumenep, Politik, Pemerintahan, Hukum, Kriminal, Pendidikan, Kesehatan, Ekonomi, Lifestyle, Budaya, Wisata, Kuliner, Hiburan, Opini, Olahraga, Teknologi, Otomotif.

Pilih Tag yang sesuai minimal 5, maksimal 10.

Format hasil akhir WAJIB berupa JSON dengan schema berikut:
{
  "seoTitle": "string (Judul SEO, maksimal 90 karakter, menarik, natural, mengandung keyword utama)",
  "lead": "string (Lead berita, 1 paragraf pendek, ringkas, menjelaskan inti berita)",
  "content": "${contentSchemaText}",
  "slug": "string (Slug SEO Friendly, lowercase, hanya huruf, angka dan tanda minus, contoh: polisi-amankan-tiga-pengedar-narkoba-proppo)",
  "metaDescription": "string (Meta Deskripsi SEO, 150-160 karakter)",
  "focusKeyword": "string (Kata kunci fokus utama)",
  "category": "string (Kategori terpilih dari daftar kategori yang diberikan)",
  "tags": ["array of strings (tag, 5 s.d 10 tag)"]
}

PENTING: Pastikan semua tanda kutip ganda (double quotes) di dalam isi string (terutama di dalam tag-tag HTML di field "content") selalu di-escape dengan benar as \\\". Seluruh response harus merupakan satu flat JSON objek yang valid.
`;

  const userContent = `
Berikut adalah artikel berita sumber yang harus Anda tulis ulang:

Judul Sumber: ${scrapedData.title}
Media Sumber: ${scrapedData.media}
Penulis Sumber: ${scrapedData.author || 'Tidak diketahui'}
Tanggal Sumber: ${scrapedData.date || 'Tidak diketahui'}
URL Sumber: ${scrapedData.url}

Isi Artikel Sumber:
${scrapedData.body}
`;

  return { systemPrompt, userContent };
}

/**
 * Calls Gemini API to generate the article using facts from the scraped news
 */
export async function generateNewsFromFacts(scrapedData: ScrapedData): Promise<GeneratedArticle> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError('GEMINI_API_KEY tidak ditemukan di file .env backend. Harap tambahkan API key Anda.', 500);
  }

  const { systemPrompt, userContent } = buildPrompt(scrapedData);

  // List of models to try in order (fallback if rate limited)
  // Ordered from lightest (less rate-limited) to most capable
  const GEMINI_MODELS = [
    'gemini-3.5-flash-lite',     // lightest, newest
    'gemini-3.1-flash-lite',     // light and fast
    'gemini-2.5-flash-lite',     // stable lite
    'gemini-2.0-flash-lite',     // older lite fallback
    'gemini-3.5-flash',          // newest flash
    'gemini-2.5-flash',          // stable flash
    'gemini-2.0-flash',          // older stable flash
  ];

  const requestBody = JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [{ text: systemPrompt + '\n\n' + userContent }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 8192,
    },
  });

  let lastError: Error | null = null;

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[AI] Mencoba model: ${model}`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        }
      );

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 3000;
        console.warn(`[AI] Model ${model} kena rate limit (429), skip ke model berikutnya...`);
        lastError = new Error(`Model ${model} kena rate limit.`);
        await new Promise(resolve => setTimeout(resolve, Math.min(waitMs, 3000)));
        continue; // try next model
      }

      if (response.status === 404) {
        console.warn(`[AI] Model ${model} tidak ditemukan (404), skip ke model berikutnya...`);
        lastError = new Error(`Model ${model} tidak tersedia.`);
        continue; // try next model
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AI] Model ${model} gagal:`, errorText);
        lastError = new Error(`API Gemini gagal (${response.status}): ${errorText.substring(0, 300)}`);
        continue; // try next model
      }

      const responseJson = await response.json();
      
      // Check for finish reason issues
      const candidate = responseJson.candidates?.[0];
      const finishReason = candidate?.finishReason;
      if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
        throw new Error(`Gemini berhenti dengan alasan: ${finishReason}`);
      }
      
      const generatedText = candidate?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        const blockReason = responseJson.promptFeedback?.blockReason;
        if (blockReason) {
          throw new Error(`Konten diblokir oleh Gemini: ${blockReason}`);
        }
        throw new Error('Gemini tidak mengembalikan teks hasil.');
      }

      const cleanedText = cleanJsonResponse(generatedText);
      const result = robustJsonParse(cleanedText);
      
      // Validate required schema fields
      if (!result.seoTitle || !result.content || !result.slug) {
        throw new Error('Format output JSON dari Gemini tidak sesuai skema.');
      }
      
      // Ensure tags is always an array
      if (!Array.isArray(result.tags)) {
        result.tags = [];
      }

      console.log(`[AI] Artikel berhasil dibuat menggunakan model: ${model}`);
      return result;

    } catch (error: any) {
      if (error instanceof AppError) throw error;
      lastError = error;
      console.error(`[AI] Error dengan model ${model}:`, error.message);
    }
  }

  // All models failed
  console.error('[AI] Semua model Gemini gagal:', lastError);
  throw new AppError(
    lastError?.message || 'Semua model AI gagal. Coba lagi beberapa saat.',
    503
  );
}

/**
 * Calls Xieqa LLM API to generate the article (alternative provider)
 * Strategy: Ask Xieqa only for plain HTML article text, then assemble full
 * GeneratedArticle locally — avoids JSON truncation from Xieqa's token limit.
 */
export async function generateNewsFromFactsXieqa(scrapedData: ScrapedData): Promise<GeneratedArticle> {
  const apiKey = process.env.XIEQA_API_KEY;
  if (!apiKey) {
    throw new AppError('XIEQA_API_KEY tidak ditemukan di file .env backend. Harap tambahkan API key Xieqa Anda.', 500);
  }

  // ── Step 1: Build a minimal prompt — ask only for HTML article content ──
  const xieqaPrompt = `
Anda adalah Editor Senior Portal Berita Nasional dan Wartawan Profesional Indonesia.
Tugas Anda HANYA menulis isi artikel berita dalam format HTML.

ATURAN WAJIB:
- Bahasa jurnalistik Indonesia yang baku, profesional, dan natural.
- Artikel ORIGINAL — bukan paraphrase kalimat per kalimat.
- Gunakan MINIMAL 4 subjudul <h2>. Gunakan <h3> jika perlu.
- Struktur wajib: <p>Lead</p> → <h2>Kronologi Kejadian</h2> → <h2>Fakta Penting</h2> → <h2>Pernyataan Resmi</h2> → <h2>Penutup</h2>
- Paragraf pendek: maksimal 3 kalimat per paragraf.
- JANGAN tulis JSON. JANGAN tulis markdown. JANGAN tulis kode. Hanya tulis HTML murni.

PANJANG ARTIKEL — WAJIB 800–1.300 KATA:
- Panjang artikel WAJIB antara 800 hingga 1.300 kata. Target ideal: 900–1.100 kata.
- Jika fakta sumber sedikit, kembangkan dengan: memperjelas kronologi, menjelaskan latar belakang, menguraikan pernyataan narasumber, memperjelas konteks dan dampak.
- Artikel harus memiliki kedalaman yang cukup untuk layak dipublikasikan sebagai berita utama di portal berita profesional.

AI DILARANG KERAS:
- Menambahkan fakta baru yang tidak ada di sumber
- Membuat asumsi atau opini
- Mengarang kutipan
- Mengubah data, angka, nama, lokasi, atau kronologi
- Mempersingkat artikel hanya karena sumber pendek

Artikel Sumber:
Judul: ${scrapedData.title}
Media: ${scrapedData.media}
Tanggal: ${scrapedData.date || 'Tidak diketahui'}

Isi Sumber (gunakan fakta-fakta di bawah ini):
${scrapedData.body.substring(0, 3000)}

Sekarang tuliskan isi artikel berita HTML-nya (800–1.300 kata, minimal 4 H2):
`.trim();

  try {
    console.log('[AI:Xieqa] Mengirim request ke Xieqa LLM (strategi 2-step)...');
    const response = await fetch(
      'https://xieqa.com/ai/llm/api/bot_api.php',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ pesan: xieqaPrompt }),
        signal: AbortSignal.timeout(120000),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI:Xieqa] Request gagal:', errorText);
      throw new Error(`Xieqa API gagal (${response.status}): ${errorText.substring(0, 300)}`);
    }

    const responseJson = await response.json();
    const rawContent = responseJson?.choices?.[0]?.message?.content || '';

    if (!rawContent || rawContent.trim().length < 20) {
      console.error('[AI:Xieqa] Response kosong atau terlalu pendek:', rawContent);
      throw new Error('Xieqa tidak mengembalikan konten artikel yang valid.');
    }

    console.log('[AI:Xieqa] Konten HTML diterima, menyusun artikel...');

    // ── Step 2: Assemble GeneratedArticle locally without relying on Xieqa for JSON ──
    const cleanContent = cleanHtmlNewlines(rawContent);

    // Derive title from source (Xieqa won't write a good SEO title reliably)
    const seoTitle = scrapedData.title.length <= 90
      ? scrapedData.title
      : scrapedData.title.substring(0, 87) + '...';

    // Extract first <p> as lead if content starts with one, else use title
    const leadMatch = cleanContent.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const lead = leadMatch
      ? leadMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 400)
      : scrapedData.title;

    // Build slug from title
    const slug = seoTitle
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u').replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const metaDescription = lead.substring(0, 157) + (lead.length > 157 ? '...' : '');

    // Detect category from title/body keywords
    const titleLower = seoTitle.toLowerCase();
    const bodyLower = (scrapedData.body || '').toLowerCase();
    let category = 'Politik';
    if (/kebakaran|banjir|gempa|bencana|longsor/.test(titleLower)) category = 'Hukum';
    else if (/korupsi|kriminal|narkoba|tersangka|polisi|kejahatan/.test(titleLower)) category = 'Kriminal';
    else if (/ekonomi|bisnis|rupiah|investasi|saham|harga|inflasi/.test(titleLower)) category = 'Ekonomi';
    else if (/pendidikan|sekolah|kampus|mahasiswa|pelajar/.test(titleLower)) category = 'Pendidikan';
    else if (/kesehatan|rumah sakit|dokter|penyakit|vaksin/.test(titleLower)) category = 'Kesehatan';
    else if (/olahraga|sepakbola|bola|timnas|piala/.test(titleLower)) category = 'Olahraga';
    else if (/teknologi|digital|aplikasi|internet|ai|robot/.test(titleLower)) category = 'Teknologi';
    else if (/bangkalan/.test(bodyLower + titleLower)) category = 'Bangkalan';
    else if (/sampang/.test(bodyLower + titleLower)) category = 'Sampang';
    else if (/pamekasan/.test(bodyLower + titleLower)) category = 'Pamekasan';
    else if (/sumenep/.test(bodyLower + titleLower)) category = 'Sumenep';

    // Build basic tags from title words
    const stopWords = new Set(['dan','di','ke','dari','yang','ini','itu','pada','dengan','untuk','dalam','adalah','oleh','atau','juga','tersebut','sebuah','seorang']);
    const tags = seoTitle
      .replace(/[^a-zA-Z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w.toLowerCase()))
      .slice(0, 7)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

    if (tags.length < 3) tags.push('Berita Terkini', 'Poros Madura');

    const focusKeyword = tags[0] || seoTitle.split(' ')[0];

    const result: GeneratedArticle = {
      seoTitle,
      lead,
      content: cleanContent,
      slug,
      metaDescription,
      focusKeyword,
      category,
      tags,
    };

    console.log('[AI:Xieqa] Artikel berhasil disusun menggunakan Xieqa LLM (2-step).');
    return result;

  } catch (error: any) {
    console.error('[AI:Xieqa] Error:', error.message);
    if (error instanceof AppError) throw error;
    if (error.name === 'TimeoutError') {
      throw new AppError('Xieqa API timeout. Coba lagi atau gunakan provider lain.', 504);
    }
    throw new AppError(`Xieqa gagal: ${error.message}`, 500);
  }
}

