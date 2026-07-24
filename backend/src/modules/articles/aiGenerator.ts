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

/**
 * Robust JSON parser that handles common issues from AI outputs
 */
function robustJsonParse(text: string): GeneratedArticle {
  // First attempt: direct parse
  try {
    return JSON.parse(text) as GeneratedArticle;
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
      return JSON.parse(fixedText) as GeneratedArticle;
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
      
      if (!seoTitle || !content || !slug) {
        throw new Error('Tidak dapat mengurai JSON dari respons Gemini.');
      }
      
      return { seoTitle, lead, content, slug, metaDescription, focusKeyword, category, tags };
    }
  }
}

/**
 * Calls Gemini API to generate the article using facts from the scraped news
 */
export async function generateNewsFromFacts(scrapedData: ScrapedData): Promise<GeneratedArticle> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError('GEMINI_API_KEY tidak ditemukan di file .env backend. Harap tambahkan API key Anda.', 500);
  }

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

Gunakan struktur isi artikel:
Lead (1 paragraf, ringkas, langsung menjelaskan inti berita)
H2 Kronologi Kejadian
(paragraf)
(paragraf)
H2 Fakta Penting
(paragraf)
(paragraf)
H2 Pernyataan Resmi
(paragraf)
(paragraf)
H2 Penutup
(paragraf)

Aturan Paragraf & Kata:
- Gunakan paragraf pendek. Maksimal 3 kalimat per paragraf.
- Pastikan keyword utama muncul secara natural.
- Jangan membuat fakta baru. Jangan mengurangi fakta penting. Jangan beropini. Jangan berhalusinasi.
- Panjang isi artikel (tidak termasuk judul, lead terpisah, slug, dsb) WAJIB memiliki panjang antara 800 hingga 1.300 kata. Target ideal: 900–1.100 kata. Artikel tidak boleh dipersingkat hanya karena artikel sumber pendek. Kembangkan isi berita secara alami dengan tetap berpedoman pada fakta yang tersedia. 
- Pengembangan isi hanya boleh dilakukan dengan cara: memperjelas kronologi kejadian, menjelaskan latar belakang peristiwa berdasarkan informasi yang ada, menguraikan pernyataan narasumber secara lebih lengkap, memperjelas konteks kejadian, menjelaskan dampak atau implikasi yang memang didukung oleh fakta, menyusun transisi antarbagian agar alur berita lebih nyaman dibaca.

Pilih Kategori yang paling sesuai dari daftar kategori berikut saja:
Bangkalan, Sampang, Pamekasan, Sumenep, Politik, Pemerintahan, Hukum, Kriminal, Pendidikan, Kesehatan, Ekonomi, Lifestyle, Budaya, Wisata, Kuliner, Hiburan, Opini, Olahraga, Teknologi, Otomotif.

Pilih Tag yang sesuai minimal 5, maksimal 10.

Format hasil akhir WAJIB berupa JSON dengan schema berikut:
{
  "seoTitle": "string (Judul SEO, maksimal 90 karakter, menarik, natural, mengandung keyword utama)",
  "lead": "string (Lead berita, 1 paragraf pendek, ringkas, menjelaskan inti berita)",
  "content": "string (Isi artikel lengkap menggunakan format tag HTML. Gunakan tag <h2> untuk judul bagian/headings seperti <h2>Kronologi Kejadian</h2>, <h2>Fakta Penting</h2>, dan tag <p> untuk paragraf. Ingat, total kata dalam tag-tag <p> di content ini wajib berkisar antara 800 s.d 1300 kata!)",
  "slug": "string (Slug SEO Friendly, lowercase, hanya huruf, angka dan tanda minus, contoh: polisi-amankan-tiga-pengedar-narkoba-proppo)",
  "metaDescription": "string (Meta Deskripsi SEO, 150-160 karakter)",
  "focusKeyword": "string (Kata kunci fokus utama)",
  "category": "string (Kategori terpilih dari daftar kategori yang diberikan)",
  "tags": ["array of strings (tag, 5 s.d 10 tag)"]
}

PENTING: Pastikan semua tanda kutip ganda (double quotes) di dalam isi string (terutama di dalam tag-tag HTML di field "content") selalu di-escape dengan benar sebagai \\\". Seluruh response harus merupakan satu flat JSON objek yang valid.
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
