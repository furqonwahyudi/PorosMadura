import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useForm } from "react-hook-form";
import { useDialog } from "../../../context/DialogContext";
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Code, Quote, Eye,
  Save, Send, Clock, ChevronRight, X, Plus, Tag, CheckCircle2,
  AlertTriangle, Settings2, Star, Zap, TrendingUp, Award, Calendar, Strikethrough, Trash2
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MediaAsset {
  id: string;
  url: string;
  filename: string;
  name: string;
  isTemporary: boolean;
  uploadedAt?: string;
}

const toolbarGroups = [
  [{ icon: <Bold size={14} />, cmd: "bold", label: "Bold" }, { icon: <Italic size={14} />, cmd: "italic", label: "Italic" }, { icon: <Underline size={14} />, cmd: "underline", label: "Underline" }, { icon: <Strikethrough size={14} />, cmd: "strikeThrough", label: "Strikethrough" }],
  [{ icon: <AlignLeft size={14} />, cmd: "justifyLeft", label: "Left" }, { icon: <AlignCenter size={14} />, cmd: "justifyCenter", label: "Center" }, { icon: <AlignRight size={14} />, cmd: "justifyRight", label: "Right" }],
  [{ icon: <List size={14} />, cmd: "insertUnorderedList", label: "Bullet" }, { icon: <ListOrdered size={14} />, cmd: "insertOrderedList", label: "Ordered" }, { icon: <Quote size={14} />, cmd: "formatBlock", val: "BLOCKQUOTE", label: "Quote" }],
];

export default function CreateArticlePage() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { showToast } = useDialog();
  const editorRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const [editorHtml, setEditorHtml] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const tagContainerRef = useRef<HTMLDivElement>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<"upload" | "library">("library");
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [activeToolStates, setActiveToolStates] = useState<Record<string, boolean>>({});

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await adminApi.post<{ success: boolean; data: MediaAsset }>("/api/media/upload?temp=true", formData);
      if (res.success && res.data) {
        showToast("Gambar berhasil diunggah! Gambar akan terdaftar di Pustaka Media Utama setelah artikel diterbitkan.", "success");
        setFeaturedImage(res.data.url);
        setSelectedMediaUrl(res.data.url);
        // Invalidate both list keys agar halaman media utama dan modal sama-sama update
        queryClient.invalidateQueries({ queryKey: ["admin", "media", "list"] });
        // Pindah ke tab library agar user bisa lihat gambar yang baru saja diupload
        setActiveMediaTab("library");
      }
    } catch (err: any) {
      showToast(err.message || "Gagal mengupload gambar", "error");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId: string) => adminApi.delete(`/api/media/${mediaId}`),
    onSuccess: () => {
      showToast("Gambar berhasil dihapus!", "success");
      queryClient.invalidateQueries({ queryKey: ["admin", "media", "list"] });
    },
    onError: (err: any) => {
      showToast(err.message || "Gagal menghapus gambar", "error");
    }
  });

  const handleDeleteMedia = (mediaId: string) => {
    deleteMediaMutation.mutate(mediaId);
  };

  // Tab State
  const [activeRightTab, setActiveRightTab] = useState("publish");
  const [showPreview, setShowPreview] = useState(false);
  const [activeSocialTab, setActiveSocialTab] = useState("whatsapp");

  // SEO States
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");

  // Input Link Berita States & Scraper Handler
  const [newsLink, setNewsLink] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingStep, setScrapingStep] = useState("");
  const [aiProvider, setAiProvider] = useState<"gemini" | "xieqa">("gemini");

  const handleScrapeLink = async () => {
    if (!newsLink.trim()) {
      showToast("URL tidak boleh kosong", "error");
      return;
    }
    
    // Validasi URL
    try {
      const parsedUrl = new URL(newsLink.trim());
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error();
      }
    } catch {
      showToast("URL tidak valid", "error");
      return;
    }

    setIsScraping(true);
    setScrapingStep("Mengambil artikel...");

    // Simulasi loading progress modern berdasarkan waktu estimasi proses
    const delays = [
      { text: "Membersihkan halaman...", ms: 2000 },
      { text: "Menganalisis fakta...", ms: 4500 },
      { text: "Menulis artikel...", ms: 8000 },
      { text: "Mengoptimasi SEO...", ms: 14000 },
    ];

    const timeoutIds: NodeJS.Timeout[] = [];
    delays.forEach(d => {
      const id = setTimeout(() => {
        setScrapingStep(currentStep => {
          if (currentStep !== "" && currentStep !== "Mengisi editor..." && currentStep !== "Selesai.") {
            return d.text;
          }
          return currentStep;
        });
      }, d.ms);
      timeoutIds.push(id);
    });

    try {
      const res = await adminApi.post<any>("/api/articles/generate-ai-news", { url: newsLink.trim(), provider: aiProvider });
      
      // Bersihkan timer
      timeoutIds.forEach(clearTimeout);

      if (res.success && res.data) {
        setScrapingStep("Mengisi editor...");
        
        // Auto fill fields
        setValue("title", res.data.title || "");
        setValue("excerpt", res.data.excerpt || "");
        setEditorHtml(res.data.content || "");
        if (editorRef.current) {
          editorRef.current.innerHTML = res.data.content || "";
        }
        
        if (res.data.categoryId) {
          setValue("categoryId", res.data.categoryId);
        }
        
        setMetaTitle(res.data.title || "");
        setMetaDescription(res.data.metaDescription || "");
        setFocusKeyword(res.data.focusKeyword || "");
        if (res.data.image) {
          setFeaturedImage(res.data.image);
        }
        
        if (res.data.tags && res.data.tags.length > 0) {
          setSelectedTags(res.data.tags);
        }

        // Sesuaikan tinggi textarea
        setTimeout(() => {
          const titleEl = document.querySelector("textarea[placeholder='Article title...']") as HTMLTextAreaElement;
          const excerptEl = document.querySelector("textarea[placeholder='Write a compelling lead paragraph...']") as HTMLTextAreaElement;
          if (titleEl) {
            titleEl.style.height = "auto";
            titleEl.style.height = titleEl.scrollHeight + "px";
          }
          if (excerptEl) {
            excerptEl.style.height = "auto";
            excerptEl.style.height = excerptEl.scrollHeight + "px";
          }
        }, 100);

        setScrapingStep("Selesai.");
        showToast("Artikel berhasil digenerate menggunakan AI!", "success");
      } else {
        throw new Error(res.message || "Gagal membuat artikel. Silakan coba lagi.");
      }
    } catch (err: any) {
      timeoutIds.forEach(clearTimeout);
      console.error("AI news generation error:", err);
      showToast(err.message || "Gagal membuat artikel. Silakan coba lagi.", "error");
    } finally {
      setTimeout(() => {
        setIsScraping(false);
        setScrapingStep("");
      }, 1500);
    }
  };

  const rightTabs = ["publish", "seo", "social"];

  // Fetch Categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await adminApi.get<{ success: boolean; data: Category[] }>("/api/categories");
      return res.data;
    }
  });

  // Fetch Users for Author, Reporter, Editor dropdowns
  const { data: users } = useQuery<User[]>({
    queryKey: ["admin", "users", "dropdown"],
    queryFn: async () => {
      const res = await adminApi.get<{ success: boolean; data: User[] }>("/api/users");
      return res.data;
    }
  });

  // Fetch Media Library — includeTemp=true agar gambar yang baru diupload (sebelum artikel dipublish) juga muncul
  const { data: mediaLibrary } = useQuery<MediaAsset[]>({
    queryKey: ["admin", "media", "list", "all"],
    queryFn: async () => {
      const res = await adminApi.get<{ success: boolean; data: MediaAsset[] }>("/api/media?includeTemp=true");
      return res.data;
    }
  });

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      title: "",
      slug: "",
      categoryId: "",
      status: "DRAFT",
      scheduledAt: "",
      excerpt: "",
      imageCaption: "",
      isBreaking: false,
      isHeadline: false,
      isEditorChoice: false,
      isTrending: false,
      authorId: "",
      editorId: "",
      reporterId: "",
    }
  });

  const formValues = watch();

  // Load article for edit mode
  const { data: existingArticle } = useQuery({
    queryKey: ["admin", "posts", id],
    queryFn: async () => {
      if (!isEditMode) return null;
      const res = await adminApi.get<{ success: boolean; data: any }>(`/api/articles/detail/${id}`);
      return res.data;
    },
    enabled: isEditMode
  });

  useEffect(() => {
    if (existingArticle) {
      reset({
        title: existingArticle.title,
        slug: existingArticle.slug || "",
        categoryId: existingArticle.categoryId,
        status: existingArticle.status,
        scheduledAt: existingArticle.scheduledAt
          ? new Date(existingArticle.scheduledAt).toISOString().slice(0, 16)
          : "",
        excerpt: existingArticle.excerpt || "",
        imageCaption: existingArticle.imageCaption || "",
        isBreaking: existingArticle.isBreaking,
        isHeadline: existingArticle.isHeadline,
        isEditorChoice: existingArticle.isEditorChoice,
        isTrending: existingArticle.isTrending,
        authorId: existingArticle.authorId || "",
        editorId: existingArticle.editorId || "",
        reporterId: existingArticle.reporterId || "",
      });
      setEditorHtml(existingArticle.content || "");
      if (editorRef.current) editorRef.current.innerHTML = existingArticle.content || "";
      setFeaturedImage(existingArticle.image || "");
      setSelectedTags(existingArticle.tags?.map((t: any) => t.tag?.name) || []);
      setMetaTitle(existingArticle.metaTitle || "");
      setMetaDescription(existingArticle.metaDescription || "");
      setFocusKeyword(existingArticle.focusKeyword || "");
      setTimeout(() => {
        const el = document.querySelector("textarea[placeholder='Article title...']") as HTMLTextAreaElement;
        if (el) {
          el.style.height = "auto";
          el.style.height = el.scrollHeight + "px";
        }
      }, 50);
    }
  }, [existingArticle, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditMode) return adminApi.put(`/api/articles/${id}`, data);
      return adminApi.post("/api/articles", data);
    },
    onSuccess: () => {
      showToast(isEditMode ? "Artikel berhasil diperbarui!" : "Artikel berhasil dibuat!", "success");
      navigate("/admin/posts");
    },
    onError: (err: any) => {
      showToast(err.message || "Gagal menyimpan artikel.", "error");
    }
  });

  const handleEditorChange = () => {
    if (editorRef.current) setEditorHtml(editorRef.current.innerHTML);
  };

  const runCommand = (command: string, value = "") => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    // Ensure there's content to work with before formatBlock
    if (command === "formatBlock") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        // If editor is empty, insert a zero-width space to create a text node
        if (!editor.textContent?.trim()) {
          editor.innerHTML = "<p>\u200B</p>";
          const p = editor.querySelector("p");
          if (p) {
            range.selectNodeContents(p);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }
    }

    document.execCommand(command, false, value);

    // After formatBlock, ensure cursor is properly placed
    if (command === "formatBlock") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        // If inside an empty block, add zero-width space so cursor can stay
        if (node instanceof HTMLElement && !node.textContent?.trim()) {
          node.innerHTML = "\u200B";
          range.setStart(node.childNodes[0], 1);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
      // Ensure there's a paragraph after the heading for the cursor to move to
      const lastChild = editor.lastElementChild;
      if (lastChild && (lastChild.tagName === "H2" || lastChild.tagName === "H3" || lastChild.tagName === "BLOCKQUOTE")) {
        const p = document.createElement("p");
        p.innerHTML = "<br>";
        editor.appendChild(p);
      }
    }

    handleEditorChange();
    setActiveToolStates({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
    });
  };

  // Track current block type for heading dropdown
  const [currentBlock, setCurrentBlock] = useState("P");

  const updateCurrentBlock = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.anchorNode;
      while (node && node !== editorRef.current) {
        if (node instanceof HTMLElement) {
          const tag = node.tagName;
          if (["H2", "H3", "P", "DIV"].includes(tag)) {
            setCurrentBlock(tag === "DIV" ? "P" : tag);
            return;
          }
        }
        node = node.parentNode;
      }
    }
    setCurrentBlock("P");
  };

  // Load available tags for autocomplete
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await adminApi.get<{ success: boolean; data: { name: string }[] }>("/api/tags?limit=250&onlyPublished=true");
        if (res && res.success) {
          setAvailableTags(res.data.map(t => t.name));
        }
      } catch (err) {
        console.error("Gagal mengambil daftar tag:", err);
      }
    };
    fetchTags();
  }, []);

  // Filter tag suggestions based on input
  useEffect(() => {
    if (tagInput.trim()) {
      const match = availableTags.filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase().trim()) && 
        !selectedTags.includes(tag)
      );
      setTagSuggestions(match);
      setShowTagSuggestions(match.length > 0);
      setFocusedSuggestionIndex(-1);
    } else {
      setTagSuggestions([]);
      setShowTagSuggestions(false);
      setFocusedSuggestionIndex(-1);
    }
  }, [tagInput, availableTags, selectedTags]);

  // Handle outside clicks to close tag suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tagContainerRef.current && !tagContainerRef.current.contains(event.target as Node)) {
        setShowTagSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectTagSuggestion = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
      if (!availableTags.includes(trimmed)) {
        setAvailableTags(prev => [...prev, trimmed]);
      }
    }
    setTagInput("");
    setShowTagSuggestions(false);
    setFocusedSuggestionIndex(-1);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && tagSuggestions.length > 0) {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => 
        prev < tagSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp" && tagSuggestions.length > 0) {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedSuggestionIndex >= 0 && focusedSuggestionIndex < tagSuggestions.length) {
        selectTagSuggestion(tagSuggestions[focusedSuggestionIndex]);
      } else if (tagInput.trim()) {
        const trimmed = tagInput.trim();
        if (!selectedTags.includes(trimmed)) {
          setSelectedTags([...selectedTags, trimmed]);
          if (!availableTags.includes(trimmed)) {
            setAvailableTags(prev => [...prev, trimmed]);
          }
        }
        setTagInput("");
      }
    } else if (e.key === "Escape") {
      setShowTagSuggestions(false);
    }
  };

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      content: editorHtml,
      image: featuredImage,
      tags: selectedTags,
      metaTitle: metaTitle || data.title,
      metaDescription: metaDescription || data.excerpt,
      focusKeyword: focusKeyword || "",
    };
    saveMutation.mutate(payload);
  };

  const wordCount = editorHtml.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // ── Dynamic Content Analysis ──────────────────────────────────────────────
  // SEO Score: points-based, max 100
  const plainText = editorHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const h2Count = (editorHtml.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (editorHtml.match(/<h3[^>]*>/gi) || []).length;
  const autoSlug = watch('title') ? watch('title').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-') : '';
  const hasExcerpt = (watch('excerpt') || '').trim().length > 30;
  const hasImage = editorHtml.includes('<img');
  const slugValue = watch('slug') || autoSlug || '';
  const selectedCategoryId = watch("categoryId");
  const selectedCategoryObj = categories?.find((c: any) => c.id === selectedCategoryId);
  const categoryName = selectedCategoryObj ? selectedCategoryObj.name.toLowerCase() : "kategori";
  const imageCount = (editorHtml.match(/<img[^>]*>/gi) || []).length + (featuredImage ? 1 : 0);

  let seoScore = 0;
  // Title: present + good length (50-70 chars) = 20pts
  if (metaTitle.length >= 50 && metaTitle.length <= 70) seoScore += 20;
  else if (metaTitle.length > 20) seoScore += 10;
  // Focus keyword present = 10pts
  if (focusKeyword) seoScore += 10;
  // Keyword in title = 10pts
  if (focusKeyword && metaTitle.toLowerCase().includes(focusKeyword.toLowerCase())) seoScore += 10;
  // Keyword in meta description = 8pts
  if (focusKeyword && metaDescription.toLowerCase().includes(focusKeyword.toLowerCase())) seoScore += 8;
  // Meta description good length (120-160 chars) = 10pts
  if (metaDescription.length >= 120 && metaDescription.length <= 160) seoScore += 10;
  else if (metaDescription.length > 50) seoScore += 5;
  // Content length (≥800 words = 15pts, ≥400 = 8pts)
  if (wordCount >= 800) seoScore += 15;
  else if (wordCount >= 400) seoScore += 8;
  else if (wordCount >= 100) seoScore += 3;
  // Has H2 headings = 8pts (+2 if ≥4 H2s)
  if (h2Count >= 4) seoScore += 10;
  else if (h2Count >= 2) seoScore += 8;
  else if (h2Count >= 1) seoScore += 4;
  // Has image = 5pts
  if (hasImage) seoScore += 5;
  // Has excerpt/lead = 5pts
  if (hasExcerpt) seoScore += 5;
  // Slug is set = 5pts
  if (slugValue) seoScore += 5;
  seoScore = Math.min(100, seoScore);

  const scoreColor = seoScore >= 70 ? 'var(--green)' : seoScore >= 40 ? 'var(--orange)' : 'var(--red)';

  // Readability: based on avg sentence length & word count
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
  const readabilityLabel = avgSentenceLength <= 15 && wordCount >= 200
    ? 'Excellent'
    : avgSentenceLength <= 20 && wordCount >= 100
    ? 'Good'
    : avgSentenceLength <= 25
    ? 'Fair'
    : 'Poor';
  const readabilityPct = readabilityLabel === 'Excellent' ? 95 : readabilityLabel === 'Good' ? 72 : readabilityLabel === 'Fair' ? 45 : 20;
  const readabilityColor = readabilityLabel === 'Excellent' || readabilityLabel === 'Good' ? 'var(--green)' : readabilityLabel === 'Fair' ? 'var(--orange)' : 'var(--red)';

  // Keyword Density: count keyword occurrences in plain text
  const kwDensity = focusKeyword && wordCount > 0
    ? (() => {
        const kw = focusKeyword.toLowerCase();
        const words = plainText.toLowerCase().split(/\s+/);
        const kwWords = kw.split(/\s+/);
        let count = 0;
        for (let i = 0; i <= words.length - kwWords.length; i++) {
          if (kwWords.every((w, j) => words[i + j] === w)) count++;
        }
        return ((count / wordCount) * 100).toFixed(1);
      })()
    : null;
  const kwDensityNum = kwDensity ? parseFloat(kwDensity) : 0;
  // Ideal keyword density: 0.5% – 2.5%
  const kwDensityColor = kwDensityNum >= 0.5 && kwDensityNum <= 2.5 ? 'var(--green)' : kwDensityNum > 0 ? 'var(--orange)' : 'var(--text-tertiary)';
  const kwDensityPct = kwDensityNum > 0 ? Math.min(100, Math.round((kwDensityNum / 3) * 100)) : 0;



  return (
    <div style={{ display: "flex", height: "calc(100vh - var(--header-height))", overflow: "hidden" }}>
      {/* Editor area */}
      <div style={{ flex: 1, overflow: "auto", background: "var(--bg-subtle)" }}>
        {/* Editor toolbar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 5,
          background: "var(--surface)", borderBottom: "1px solid var(--border)",
          padding: "8px 24px", display: "flex", gap: 2, alignItems: "center",
        }}>
          {/* Heading select */}
          <select
            value={currentBlock}
            onChange={(e) => {
              runCommand("formatBlock", e.target.value);
              setCurrentBlock(e.target.value);
            }}
            style={{
              padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)",
              background: "var(--bg-subtle)", color: "var(--text-secondary)", fontSize: 12,
              cursor: "pointer", outline: "none",
            }}
          >
            <option value="P">Normal</option>
            <option value="H2">Heading 2</option>
            <option value="H3">Heading 3</option>
          </select>

          <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 6px" }} />

          {toolbarGroups.map((group, gi) => (
            <span key={gi} style={{ display: "flex", gap: 1 }}>
              {group.map(btn => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => runCommand(btn.cmd, btn.val)}
                  title={btn.label}
                  style={{
                    width: 30, height: 28, borderRadius: 5, border: "none",
                    background: "transparent", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "var(--text-secondary)", transition: "background 0.1s",
                  }}
                  className="hover:bg-[var(--bg-muted)]"
                >
                  {btn.icon}
                </button>
              ))}
              {gi < toolbarGroups.length - 1 && (
                <div style={{ width: 1, height: 24, background: "var(--border)", margin: "2px 4px" }} />
              )}
            </span>
          ))}

          <div style={{ width: 1, height: 24, background: "var(--border)", margin: "2px 4px" }} />

          <button
            type="button"
            onClick={() => {
              const url = prompt("Masukkan URL link:");
              if (url) runCommand("createLink", url);
            }}
            style={{
              width: 30, height: 28, borderRadius: 5, border: "none", background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)",
            }}
            className="hover:bg-[var(--bg-muted)]"
          >
            <LinkIcon size={14} />
          </button>

          <button
            type="button"
            onClick={() => setShowMediaModal(true)}
            style={{
              width: 30, height: 28, borderRadius: 5, border: "none", background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)",
            }}
            className="hover:bg-[var(--bg-muted)]"
          >
            <ImageIcon size={14} />
          </button>

          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>
              {wordCount} words · {readingTime} min read
            </span>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
                background: showPreview ? "var(--bg-muted)" : "transparent",
                border: "1px solid var(--border)", borderRadius: 6,
                cursor: "pointer", color: "var(--text-secondary)", fontSize: 12,
              }}
            >
              <Eye size={13} /> Preview
            </button>
          </div>
        </div>

        {/* Writing Area */}
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 48px" }}>
          {/* Category Tag above title */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 20 }}>
            {categories?.filter(c => c.id === formValues.categoryId).map(cat => (
              <span key={cat.id} style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 4,
                background: "var(--brand-subtle)", color: "var(--brand)", fontWeight: 700,
                textTransform: "uppercase"
              }}>{cat.name}</span>
            ))}
          </div>

          <form id="article-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Title */}
            <textarea
              placeholder="Article title..."
              {...register("title")}
              required
              rows={1}
              style={{
                width: "100%", fontSize: 32, fontWeight: 700, color: "var(--text-primary)",
                lineHeight: 1.25, letterSpacing: -0.8, border: "none", background: "transparent",
                outline: "none", resize: "none", fontFamily: "inherit",
                minHeight: 48, display: "block", marginBottom: 12,
              }}
              onInput={(e) => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }}
            />

            {/* Excerpt / Lead */}
            <textarea
              placeholder="Write a compelling lead paragraph..."
              {...register("excerpt")}
              rows={2}
              style={{
                width: "100%", fontSize: 18, color: "#1F2937", lineHeight: 1.6,
                border: "none", background: "transparent", outline: "none", resize: "none",
                fontFamily: "inherit", minHeight: 60, display: "block",
                borderBottom: "1px solid var(--border-subtle)", paddingBottom: 16, marginBottom: 20,
              }}
            />

            {/* Content editable body */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={() => { handleEditorChange(); updateCurrentBlock(); }}
              onKeyUp={updateCurrentBlock}
              onClick={updateCurrentBlock}
              className="prose-editor min-h-[480px] outline-none text-base leading-[1.75] focus:bg-slate-50/10 transition-colors"
              style={{
                fontFamily: "inherit",
                fontSize: 15,
                color: "var(--text-primary)",
                width: "100%",
                display: "block",
              }}
              data-placeholder={"Start writing your article...\n\nUse the toolbar above to format text. You can add headings, images, links, and more.\n\nTip: Press Cmd+S to save a draft."}
            />
          </form>

          {/* SEO Analysis bottom */}
          <div style={{
            marginTop: 32, padding: 20, background: "var(--surface)",
            border: "1px solid var(--border)", borderRadius: 12,
          }}>
            <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              Content Analysis
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
              {[
                { label: "SEO Score", value: `${seoScore}/100`, color: scoreColor, pct: seoScore },
                { label: "Readability", value: readabilityLabel, color: readabilityColor, pct: readabilityPct },
                { label: "Keyword Density", value: kwDensity ? `${kwDensity}%` : "—", color: kwDensityColor, pct: kwDensityPct },
              ].map(item => (
                <div key={item.label} style={{ padding: "12px", background: "var(--bg-subtle)", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: item.color, fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</div>
                  <div style={{ height: 3, borderRadius: 99, background: "var(--border)", marginTop: 8 }}>
                    <div style={{ height: "100%", borderRadius: 99, background: item.color, width: `${item.pct}%`, transition: "width 0.4s ease" }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Detail stats row */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              {[
                { label: "Kata", value: wordCount.toLocaleString(), ok: wordCount >= 800, warn: wordCount > 0 && wordCount < 800 },
                { label: "H2", value: h2Count, ok: h2Count >= 4, warn: h2Count > 0 && h2Count < 4 },
                { label: "H3", value: h3Count, ok: h3Count >= 1, warn: false },
                { label: "Gambar", value: hasImage ? "Ada" : "—", ok: hasImage, warn: false },
              ].map(stat => (
                <div key={stat.label} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  fontSize: 11, color: stat.ok ? "var(--green)" : stat.warn ? "var(--orange)" : "var(--text-tertiary)",
                }}>
                  <span style={{ fontWeight: 700 }}>{stat.value}</span>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>


            {/* Google preview */}
            <div style={{ padding: 14, background: "var(--bg-subtle)", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 8, fontWeight: 500 }}>
                Google Snippet Preview
              </div>
              <div style={{ fontSize: 18, color: "#1a0dab", fontWeight: 400, marginBottom: 2, lineHeight: 1.3 }}>
                {metaTitle || watch("title") || "Article Title Here — Poros Madura"}
              </div>
              <div style={{ fontSize: 13, color: "#006621", marginBottom: 4 }}>
                porosmadura.com › {categories?.find(c => c.id === formValues.categoryId)?.slug || "kategori"} › {autoSlug || "article-slug"}
              </div>
              <div style={{ fontSize: 13, color: "#545454", lineHeight: 1.5 }}>
                {metaDescription || watch("excerpt") || "Meta description will appear here. Write a compelling description between 120–160 characters."}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right sticky sidebar panel */}
      <div style={{
        width: 300, background: "var(--surface)", borderLeft: "1px solid var(--border)",
        display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0,
      }}>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 4px" }}>
          {rightTabs.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveRightTab(tab)}
              style={{
                flex: 1, padding: "12px 4px", border: "none",
                borderBottom: activeRightTab === tab ? "2px solid var(--brand)" : "2px solid transparent",
                background: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 500,
                color: activeRightTab === tab ? "var(--brand)" : "var(--text-tertiary)",
                transition: "color 0.1s",
                textTransform: "capitalize",
              }}
            >
              {tab === "publish" ? "Publish" : tab === "seo" ? "SEO" : "Social"}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }} className="scrollbar-thin">
          {activeRightTab === "publish" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Input Link Berita */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                  Input Link Berita
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <input
                    type="url"
                    placeholder="https://example.com/news-url"
                    value={newsLink}
                    onChange={(e) => setNewsLink(e.target.value)}
                    style={{
                      width: "100%", padding: "7px 10px", borderRadius: 8,
                      border: "1px solid var(--border)", background: "var(--bg-subtle)",
                      color: "var(--text-primary)", fontSize: 12.5, outline: "none",
                    }}
                  />
                  {/* AI Provider Toggle */}
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["gemini", "xieqa"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAiProvider(p)}
                        disabled={isScraping}
                        style={{
                          flex: 1, padding: "6px 8px", borderRadius: 7, border: "1.5px solid",
                          borderColor: aiProvider === p ? "var(--brand)" : "var(--border)",
                          background: aiProvider === p ? "var(--brand-subtle)" : "var(--bg-subtle)",
                          color: aiProvider === p ? "var(--brand)" : "var(--text-tertiary)",
                          fontSize: 11.5, fontWeight: aiProvider === p ? 700 : 500,
                          cursor: isScraping ? "not-allowed" : "pointer",
                          transition: "all 0.15s ease",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                        }}
                      >
                        {p === "gemini" ? "🔵 Gemini" : "🟣 Xieqa"}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleScrapeLink}
                    disabled={isScraping}
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 8,
                      border: "none", background: "var(--brand)", color: "#fff",
                      fontSize: 12, fontWeight: 600, cursor: isScraping ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      opacity: isScraping ? 0.7 : 1, transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => { if (!isScraping) e.currentTarget.style.background = "var(--brand-hover)"; }}
                    onMouseLeave={(e) => { if (!isScraping) e.currentTarget.style.background = "var(--brand)"; }}
                  >
                    {isScraping ? `Generating via ${aiProvider === "gemini" ? "Gemini" : "Xieqa"}...` : "Gaskeun"}
                  </button>

                  {/* Progress Checklist Modern */}
                  {isScraping && (
                    <div style={{
                      marginTop: 10,
                      padding: "12px 14px",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      boxShadow: "var(--shadow-sm)",
                    }}>
                      {[
                        "Mengambil artikel...",
                        "Membersihkan halaman...",
                        "Menganalisis fakta...",
                        "Menulis artikel...",
                        "Mengoptimasi SEO...",
                        "Mengisi editor...",
                        "Selesai."
                      ].map((step, idx) => {
                        const steps = [
                          "Mengambil artikel...",
                          "Membersihkan halaman...",
                          "Menganalisis fakta...",
                          "Menulis artikel...",
                          "Mengoptimasi SEO...",
                          "Mengisi editor...",
                          "Selesai."
                        ];
                        const currentStepIdx = steps.indexOf(scrapingStep);
                        const isCompleted = idx < currentStepIdx || scrapingStep === "Selesai.";
                        const isActive = idx === currentStepIdx && scrapingStep !== "Selesai.";
                        
                        return (
                          <div key={idx} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            opacity: isActive ? 1 : isCompleted ? 0.8 : 0.4,
                            transition: "all 0.2s ease"
                          }}>
                            {isCompleted ? (
                              <CheckCircle2 size={12} style={{ color: "var(--green)", flexShrink: 0 }} />
                            ) : isActive ? (
                              <div className="animate-spin" style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                border: "1.5px solid var(--brand)",
                                borderTopColor: "transparent",
                                flexShrink: 0
                              }} />
                            ) : (
                              <div style={{
                                width: 4,
                                height: 4,
                                borderRadius: "50%",
                                background: "var(--text-tertiary)",
                                marginLeft: 3,
                                marginRight: 3,
                                flexShrink: 0
                              }} />
                            )}
                            <span style={{
                              fontSize: 11,
                              fontWeight: isActive ? 600 : 400,
                              color: isActive ? "var(--brand)" : "var(--text-secondary)",
                            }}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ height: 1, background: "var(--border-subtle)", margin: "4px 0" }} />

              {/* Status */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                  Status
                </label>
                <div style={{ display: "flex", gap: 4 }}>
                  {([
                    { val: "DRAFT", label: "Draft" },
                    { val: "PUBLISHED", label: "Published" },
                    { val: "SCHEDULED", label: "Scheduled" }
                  ] as const).map(s => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setValue("status", s.val)}
                      style={{
                        flex: 1, padding: "5px 4px", borderRadius: 6,
                        border: "1px solid",
                        borderColor: formValues.status === s.val ? "var(--brand)" : "var(--border)",
                        background: formValues.status === s.val ? "var(--brand-subtle)" : "transparent",
                        color: formValues.status === s.val ? "var(--brand)" : "var(--text-secondary)",
                        cursor: "pointer", fontSize: 11, fontWeight: 500,
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Author */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                  Author
                </label>
                <select 
                  {...register("authorId")}
                  style={{
                    width: "100%", padding: "7px 10px", borderRadius: 8,
                    border: "1px solid var(--border)", background: "var(--bg-subtle)",
                    color: "var(--text-primary)", fontSize: 13, outline: "none", cursor: "pointer",
                  }}
                >
                  <option value="">-- Pembuat Otomatis (Default) --</option>
                  {users?.map(u => (
                    <option key={`auth-${u.id}`} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reporter */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                  Reporter
                </label>
                <select 
                  {...register("reporterId")}
                  style={{
                    width: "100%", padding: "7px 10px", borderRadius: 8,
                    border: "1px solid var(--border)", background: "var(--bg-subtle)",
                    color: "var(--text-primary)", fontSize: 13, outline: "none", cursor: "pointer",
                  }}
                >
                  <option value="">-- Tanpa Reporter --</option>
                  {users?.map(u => (
                    <option key={`rep-${u.id}`} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Editor */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                  Editor
                </label>
                <select 
                  {...register("editorId")}
                  style={{
                    width: "100%", padding: "7px 10px", borderRadius: 8,
                    border: "1px solid var(--border)", background: "var(--bg-subtle)",
                    color: "var(--text-primary)", fontSize: 13, outline: "none", cursor: "pointer",
                  }}
                >
                  <option value="">-- Tanpa Editor --</option>
                  {users?.map(u => (
                    <option key={`ed-${u.id}`} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Featured Image inside sidebar */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                  Featured Image
                </label>
                {featuredImage ? (
                  <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }} className="group">
                    <img src={featuredImage} alt="Featured" style={{ width: "100%", height: 120, objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => setFeaturedImage("")}
                      style={{
                        position: "absolute", top: 6, right: 6,
                        background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%",
                        width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", cursor: "pointer",
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setShowMediaModal(true)}
                    style={{
                      border: "1.5px dashed var(--border)", borderRadius: 8,
                      padding: "20px 16px", textAlign: "center", cursor: "pointer",
                      transition: "border-color 0.1s, background 0.1s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.background = "var(--brand-subtle)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "transparent"; }}
                  >
                    <ImageIcon size={20} style={{ color: "var(--text-tertiary)", marginBottom: 6, margin: "0 auto" }} />
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>Upload featured image</div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>or drag & drop</div>
                  </div>
                )}
              </div>

              {/* Schedule Release */}
              {formValues.status === "SCHEDULED" && (
                <div className="animate-fade-in">
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                    Jadwal Rilis
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-subtle)" }}>
                    <Calendar size={14} style={{ color: "var(--text-tertiary)" }} />
                    <input
                      type="datetime-local"
                      {...register("scheduledAt")}
                      style={{ border: "none", background: "transparent", fontSize: 12, outline: "none", color: "var(--text-primary)", width: "100%" }}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Categories */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                  Categories
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {categories?.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setValue("categoryId", formValues.categoryId === cat.id ? "" : cat.id)}
                      style={{
                        padding: "3px 9px", borderRadius: 6, border: "1px solid",
                        borderColor: formValues.categoryId === cat.id ? "var(--brand)" : "var(--border)",
                        background: formValues.categoryId === cat.id ? "var(--brand-subtle)" : "transparent",
                        color: formValues.categoryId === cat.id ? "var(--brand)" : "var(--text-secondary)",
                        cursor: "pointer", fontSize: 11.5, fontWeight: 500, transition: "all 0.1s",
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                  Tags
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                  {selectedTags.map(tag => (
                    <span key={tag} style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "2px 8px",
                      borderRadius: 99, background: "var(--bg-muted)", color: "var(--text-secondary)",
                      fontSize: 11.5,
                    }}>
                      {tag}
                      <X size={10} style={{ cursor: "pointer" }}
                        onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))} />
                    </span>
                  ))}
                </div>
                <div ref={tagContainerRef} style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Ketik tag dan tekan Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    onFocus={() => {
                      if (tagSuggestions.length > 0) setShowTagSuggestions(true);
                    }}
                    style={{
                      width: "100%", padding: "7px 10px", borderRadius: 8,
                      border: "1px solid var(--border)", background: "var(--bg-subtle)",
                      color: "var(--text-primary)", fontSize: 12.5, outline: "none",
                    }}
                  />
                  {showTagSuggestions && tagSuggestions.length > 0 && (
                    <div style={{
                      position: "absolute", top: "100%", left: 0, right: 0,
                      maxHeight: 200, overflowY: "auto", background: "var(--surface-raised)",
                      border: "1px solid var(--border)", borderRadius: 8,
                      boxShadow: "var(--shadow-md)", zIndex: 9999,
                      marginTop: 4, padding: "4px 0"
                    }}>
                      {tagSuggestions.map((tag, idx) => (
                        <div
                          key={`tag-suggest-${tag}`}
                          onClick={() => selectTagSuggestion(tag)}
                          onMouseEnter={() => setFocusedSuggestionIndex(idx)}
                          style={{
                            padding: "6px 12px", fontSize: 12, cursor: "pointer",
                            background: focusedSuggestionIndex === idx ? "var(--bg-muted)" : "transparent",
                            color: focusedSuggestionIndex === idx ? "var(--brand)" : "var(--text-primary)",
                            fontWeight: focusedSuggestionIndex === idx ? 600 : 400,
                            transition: "all 0.1s"
                          }}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Slug */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                  Slug
                </label>
                <input
                  value={autoSlug}
                  disabled
                  placeholder="article-slug"
                  style={{
                    width: "100%", padding: "7px 10px", borderRadius: 8,
                    border: "1px solid var(--border)", background: "var(--bg-muted)",
                    color: "var(--text-secondary)", fontSize: 12, outline: "none",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
              </div>

              {/* Label Khusus */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
                  Label Khusus
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Rekomendasi Checkbox */}
                  <label
                    style={{
                      display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                      padding: "8px 12px", borderRadius: 8,
                      border: `1px solid ${formValues.isEditorChoice ? "var(--brand)" : "var(--border)"}`,
                      background: formValues.isEditorChoice ? "var(--brand-subtle)" : "var(--bg-subtle)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      border: `1.5px solid ${formValues.isEditorChoice ? "var(--brand)" : "var(--border-strong)"}`,
                      background: formValues.isEditorChoice ? "var(--brand)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}>
                      {formValues.isEditorChoice && (
                        <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      {...register("isEditorChoice")}
                      style={{ display: "none" }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Star size={13} style={{ color: formValues.isEditorChoice ? "var(--brand)" : "var(--text-tertiary)" }} />
                      <span style={{ fontSize: 12.5, fontWeight: 500, color: formValues.isEditorChoice ? "var(--brand)" : "var(--text-secondary)" }}>Rekomendasi</span>
                    </div>
                  </label>

                  {/* Breaking Checkbox */}
                  <label
                    style={{
                      display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                      padding: "8px 12px", borderRadius: 8,
                      border: `1px solid ${formValues.isBreaking ? "var(--red)" : "var(--border)"}`,
                      background: formValues.isBreaking ? "var(--red-subtle)" : "var(--bg-subtle)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      border: `1.5px solid ${formValues.isBreaking ? "var(--red)" : "var(--border-strong)"}`,
                      background: formValues.isBreaking ? "var(--red)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}>
                      {formValues.isBreaking && (
                        <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      {...register("isBreaking")}
                      style={{ display: "none" }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Zap size={13} style={{ color: formValues.isBreaking ? "var(--red)" : "var(--text-tertiary)" }} />
                      <span style={{ fontSize: 12.5, fontWeight: 500, color: formValues.isBreaking ? "var(--red)" : "var(--text-secondary)" }}>Breaking</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === "seo" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Content Analysis Card */}
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  Content Analysis
                </div>

                {/* 3 Metric Cards Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                }}>
                  {/* SEO Score Card */}
                  <div style={{
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    padding: "8px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 64,
                    textAlign: "center",
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase" }}>SEO Score</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor, fontFamily: "'JetBrains Mono', monospace" }}>
                      {seoScore}/100
                    </span>
                    <div style={{ width: "100%", height: 3, background: scoreColor + "20", borderRadius: 2, overflow: "hidden", marginTop: 4 }}>
                      <div style={{ width: `${seoScore}%`, height: "100%", background: scoreColor }} />
                    </div>
                  </div>

                  {/* Readability Card */}
                  <div style={{
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    padding: "8px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 64,
                    textAlign: "center",
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Readability</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: readabilityColor }}>
                      {readabilityLabel}
                    </span>
                    <div style={{ width: "100%", height: 3, background: readabilityColor + "20", borderRadius: 2, overflow: "hidden", marginTop: 4 }}>
                      <div style={{ width: `${readabilityPct}%`, height: "100%", background: readabilityColor }} />
                    </div>
                  </div>

                  {/* Keyword Density Card */}
                  <div style={{
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    padding: "8px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 64,
                    textAlign: "center",
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Density</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: kwDensityColor }}>
                      {focusKeyword && kwDensity ? `${kwDensity}%` : "—"}
                    </span>
                    <div style={{ width: "100%", height: 3, background: (focusKeyword ? kwDensityColor : "var(--border)") + "20", borderRadius: 2, overflow: "hidden", marginTop: 4 }}>
                      <div style={{ width: `${kwDensityPct}%`, height: "100%", background: focusKeyword ? kwDensityColor : "transparent" }} />
                    </div>
                  </div>
                </div>

                {/* Counts Badges Row */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 6,
                  marginTop: 4,
                }}>
                  {[
                    { label: `${wordCount} Kata`, ok: wordCount >= 300, info: "Min. 300 kata" },
                    { label: `${h2Count} H2`, ok: h2Count >= 1, info: "Subheading H2" },
                    { label: `${h3Count} H3`, ok: h3Count >= 0, info: "Subheading H3" },
                    { label: imageCount > 0 ? `${imageCount} Gambar` : "— Gambar", ok: imageCount > 0, info: "Media & Cover" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      title={item.info}
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border-subtle)",
                        padding: "4px 8px",
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: item.ok ? "var(--green)" : "var(--orange)",
                      }} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Snippet Preview Card */}
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  Google Snippet Preview
                </div>
                
                {/* Search result preview mockup */}
                <div style={{
                  background: "#ffffff",
                  border: "1px solid #e1e3e6",
                  borderRadius: 8,
                  padding: 12,
                  fontFamily: "Arial, sans-serif",
                  textAlign: "left",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                  {/* Link path breadcrumbs */}
                  <div style={{
                    fontSize: 11,
                    color: "#4d5156",
                    marginBottom: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    <span>porosmadura.com</span>
                    <span style={{ color: "#bdc1c6" }}>&gt;</span>
                    <span style={{ color: "#70757a" }}>{categoryName}</span>
                    <span style={{ color: "#bdc1c6" }}>&gt;</span>
                    <span style={{ color: "#70757a", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {slugValue || "article-slug"}
                    </span>
                  </div>

                  {/* Title (Blue link) */}
                  <div style={{
                    fontSize: 14,
                    fontWeight: "normal",
                    color: "#1a0dab",
                    lineHeight: "1.3",
                    marginBottom: 4,
                    wordBreak: "break-word",
                    cursor: "pointer",
                  }}>
                    {metaTitle || watch("title") || "Article Title Here"} — Poros Madura
                  </div>

                  {/* Meta Description */}
                  <div style={{
                    fontSize: 12,
                    color: "#4d5156",
                    lineHeight: "1.4",
                    wordBreak: "break-word",
                  }}>
                    {metaDescription || watch("excerpt") || "Meta description will appear here. Write a compelling description between 120-160 characters."}
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 5 }}>
                    Focus Keyword
                  </label>
                  <input
                    value={focusKeyword}
                    onChange={e => setFocusKeyword(e.target.value)}
                    placeholder="e.g. beasiswa sumenep 2025"
                    style={{
                      width: "100%", padding: "7px 10px", borderRadius: 8,
                      border: "1px solid var(--border)", background: "var(--bg-subtle)",
                      color: "var(--text-primary)", fontSize: 12.5, outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 5 }}>
                    SEO Title
                  </label>
                  <input
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    placeholder="Optimized title for search engines"
                    style={{
                      width: "100%", padding: "7px 10px", borderRadius: 8,
                      border: "1px solid var(--border)", background: "var(--bg-subtle)",
                      color: "var(--text-primary)", fontSize: 12.5, outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 5 }}>
                    Meta Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    placeholder="Compelling description (120–160 chars)"
                    rows={3}
                    style={{
                      width: "100%", padding: "7px 10px", borderRadius: 8,
                      border: "1px solid var(--border)", background: "var(--bg-subtle)",
                      color: "var(--text-primary)", fontSize: 12.5, outline: "none",
                      resize: "none", fontFamily: "inherit",
                    }}
                  />
                </div>

                {/* SEO Checklist Analysis */}
                <div style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: 12,
                  marginTop: 4,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    SEO Checklist Analysis
                  </div>
                  {[
                    { label: "Panjang Judul SEO (50-70 karakter)", ok: metaTitle.length >= 50 && metaTitle.length <= 70 },
                    { label: "Menentukan Focus Keyword", ok: !!focusKeyword },
                    { label: "Focus Keyword di Judul SEO", ok: !!(focusKeyword && metaTitle.toLowerCase().includes(focusKeyword.toLowerCase())) },
                    { label: "Focus Keyword di Deskripsi Meta", ok: !!(focusKeyword && metaDescription.toLowerCase().includes(focusKeyword.toLowerCase())) },
                    { label: "Panjang Deskripsi Meta (120-160 karakter)", ok: metaDescription.length >= 120 && metaDescription.length <= 160 },
                    { label: "Konten minimal 300 kata", ok: wordCount >= 300 },
                    { label: "Memiliki Heading H2", ok: h2Count >= 1 },
                    { label: "Memiliki Gambar Utama / Gambar Konten", ok: imageCount > 0 },
                    { label: "Kutipan / Paragraf Utama terisi", ok: !!watch("excerpt") },
                    { label: "Slug URL terisi", ok: !!watch("slug") },
                  ].map((chk, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--text-secondary)" }}>
                      <span style={{
                        width: 14, height: 14, borderRadius: "50%",
                        background: chk.ok ? "var(--green)" : "var(--orange)",
                        color: "#fff", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 8, fontWeight: 800
                      }}>
                        {chk.ok ? "✓" : "×"}
                      </span>
                      <span style={{ opacity: chk.ok ? 1 : 0.8 }}>{chk.label}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

          {activeRightTab === "social" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Unified Auto OG Card */}
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 10,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                    Unified OpenGraph (Auto-Generated)
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)", lineHeight: "1.3" }}>
                    Metadata OpenGraph dan Twitter Card dihasilkan otomatis dari judul, kutipan, dan gambar utama artikel ini.
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* OG Title */}
                  <div>
                    <label style={{ fontSize: 9, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", display: "block", marginBottom: 3 }}>
                      OG Title
                    </label>
                    <input
                      disabled
                      value={metaTitle || watch("title") || "Article Title Here"}
                      style={{
                        width: "100%", padding: "5px 8px", borderRadius: 6,
                        border: "1px solid var(--border)", background: "var(--bg-subtle)",
                        color: "var(--text-secondary)", fontSize: 11.5, cursor: "not-allowed",
                        opacity: 0.85,
                      }}
                    />
                  </div>

                  {/* OG Description */}
                  <div>
                    <label style={{ fontSize: 9, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", display: "block", marginBottom: 3 }}>
                      OG Description
                    </label>
                    <textarea
                      disabled
                      rows={2}
                      value={metaDescription || watch("excerpt") || "Meta description will appear here. Write a compelling description between 120-160 characters."}
                      style={{
                        width: "100%", padding: "5px 8px", borderRadius: 6,
                        border: "1px solid var(--border)", background: "var(--bg-subtle)",
                        color: "var(--text-secondary)", fontSize: 11.5, cursor: "not-allowed",
                        resize: "none", fontFamily: "inherit", opacity: 0.85,
                      }}
                    />
                  </div>

                  {/* OG Image */}
                  <div>
                    <label style={{ fontSize: 9, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", display: "block", marginBottom: 3 }}>
                      OG Image
                    </label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input
                        disabled
                        value={featuredImage || "https://picsum.photos/seed/news/1200/630"}
                        style={{
                          flex: 1, padding: "5px 8px", borderRadius: 6,
                          border: "1px solid var(--border)", background: "var(--bg-subtle)",
                          color: "var(--text-secondary)", fontSize: 11.5, cursor: "not-allowed",
                          opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis",
                        }}
                      />
                      <div style={{
                        width: 28, height: 28, borderRadius: 4, overflow: "hidden",
                        border: "1px solid var(--border-subtle)", flexShrink: 0,
                        background: "#eee",
                      }}>
                        <img
                          src={featuredImage || "https://picsum.photos/seed/news/1200/630"}
                          alt="Thumbnail preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            e.currentTarget.src = "https://picsum.photos/seed/news/1200/630";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Preview Selector */}
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 10,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                  Social Media Link Preview
                </div>

                {/* Pill tab buttons */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 4,
                }}>
                  {[
                    { key: "whatsapp", label: "WhatsApp" },
                    { key: "instagram", label: "Instagram" },
                    { key: "twitter", label: "X (Twitter)" },
                    { key: "facebook", label: "Facebook" },
                    { key: "linkedin", label: "LinkedIn" },
                    { key: "threads", label: "Threads" },
                  ].map(p => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setActiveSocialTab(p.key)}
                      style={{
                        padding: "6px 2px",
                        fontSize: 10,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: activeSocialTab === p.key ? "1px solid var(--brand)" : "1px solid var(--border)",
                        background: activeSocialTab === p.key ? "var(--brand-subtle)" : "var(--bg-subtle)",
                        color: activeSocialTab === p.key ? "var(--brand)" : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.1s ease",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Preview Mockup Container */}
                <div style={{ marginTop: 4 }}>
                  {activeSocialTab === "whatsapp" && (
                    <div style={{
                      background: "#efeae2",
                      padding: 10,
                      borderRadius: 10,
                      border: "1px solid #dcdcdc",
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                    }}>
                      {/* WhatsApp message bubble */}
                      <div style={{
                        background: "#d9fdd3",
                        borderRadius: "8px 8px 8px 0px",
                        padding: 6,
                        maxWidth: "92%",
                        boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                        fontSize: 12.5,
                        color: "#111b21",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                      }}>
                        {/* Preview Box */}
                        <div style={{
                          background: "#e6f8e0",
                          borderRadius: 6,
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "row-reverse",
                          border: "1px solid #c9ebd1",
                          alignItems: "stretch",
                        }}>
                          {/* Image Thumbnail */}
                          <div style={{ width: 70, minHeight: 70, flexShrink: 0 }}>
                            <img
                              src={featuredImage || "https://picsum.photos/seed/news/1200/630"}
                              alt="Thumbnail"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                          {/* Text info */}
                          <div style={{ flex: 1, padding: "6px 8px", textAlign: "left" }}>
                            <div style={{ fontSize: 9.5, color: "#54656f", textTransform: "lowercase", marginBottom: 2 }}>youdie.my.id</div>
                            <div style={{ fontSize: 11.5, fontWeight: "bold", color: "#111b21", lineHeight: "1.3", margin: "2px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {metaTitle || watch("title") || "Article Title Here"}
                            </div>
                            <div style={{ fontSize: 10.5, color: "#54656f", lineHeight: "1.3", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {metaDescription || watch("excerpt") || "Meta description will appear here."}
                            </div>
                          </div>
                        </div>
                        {/* URL inside message */}
                        <div style={{ color: "#007bfc", fontSize: 11.5, marginTop: 4, textDecoration: "underline", wordBreak: "break-all" }}>
                          https://youdie.my.id/{selectedCategoryObj?.slug || "berita"}/{slugValue || "article-slug"}
                        </div>
                        <div style={{ textAlign: "right", fontSize: 9, color: "#667781", marginTop: 2 }}>
                          11:23 AM
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSocialTab === "instagram" && (
                    <div style={{
                      background: "#ffffff",
                      border: "1px solid #dbdbdb",
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                    }}>
                      <div style={{ height: 110, width: "100%", overflow: "hidden", background: "#f0f0f0" }}>
                        <img
                          src={featuredImage || "https://picsum.photos/seed/news/1200/630"}
                          alt="Meta preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ padding: "8px 10px", textAlign: "left" }}>
                        <div style={{ fontSize: 9.5, color: "#8e8e8e", textTransform: "lowercase", marginBottom: 2 }}>youdie.my.id</div>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: "#262626", lineHeight: "1.3", marginBottom: 3 }}>
                          {metaTitle || watch("title") || "Article Title Here"}
                        </div>
                        <div style={{ fontSize: 10.5, color: "#8e8e8e", lineHeight: "1.3", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {metaDescription || watch("excerpt") || "Meta description will appear here."}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSocialTab === "twitter" && (
                    <div style={{
                      background: "#ffffff",
                      border: "1px solid #e1e8ed",
                      borderRadius: 14,
                      overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                    }}>
                      <div style={{ height: 110, width: "100%", overflow: "hidden", background: "#f0f0f0" }}>
                        <img
                          src={featuredImage || "https://picsum.photos/seed/news/1200/630"}
                          alt="X Card preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ padding: "8px 10px", borderTop: "1px solid #e1e8ed", textAlign: "left" }}>
                        <div style={{ fontSize: 10, color: "#536471", textTransform: "lowercase", marginBottom: 2 }}>youdie.my.id</div>
                        <div style={{ fontSize: 12, fontWeight: "bold", color: "#0f1419", lineHeight: "1.3", marginBottom: 2 }}>
                          {metaTitle || watch("title") || "Article Title Here"}
                        </div>
                        <div style={{ fontSize: 11, color: "#536471", lineHeight: "1.3", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {metaDescription || watch("excerpt") || "Meta description will appear here."}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSocialTab === "facebook" && (
                    <div style={{
                      background: "#ffffff",
                      border: "1px solid #ced0d4",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      fontFamily: "Segoe UI, Helvetica, Arial, sans-serif",
                    }}>
                      <div style={{ height: 110, width: "100%", overflow: "hidden", background: "#f0f0f0" }}>
                        <img
                          src={featuredImage || "https://picsum.photos/seed/news/1200/630"}
                          alt="Facebook Link Preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ padding: "8px 10px", background: "#f2f3f5", borderTop: "1px solid #e9ebee", textAlign: "left" }}>
                        <div style={{ fontSize: 11, color: "#65676b", textTransform: "lowercase", marginBottom: 2 }}>youdie.my.id</div>
                        <div style={{ fontSize: 12, fontWeight: "bold", color: "#050505", lineHeight: "1.3", marginBottom: 3 }}>
                          {metaTitle || watch("title") || "Article Title Here"}
                        </div>
                        <div style={{ fontSize: 11, color: "#65676b", lineHeight: "1.3", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {metaDescription || watch("excerpt") || "Meta description will appear here."}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSocialTab === "linkedin" && (
                    <div style={{
                      background: "#f3f6f8",
                      border: "1px solid #e0e0e0",
                      borderRadius: 4,
                      overflow: "hidden",
                      fontFamily: "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                    }}>
                      <div style={{ height: 110, width: "100%", overflow: "hidden", background: "#e0e0e0" }}>
                        <img
                          src={featuredImage || "https://picsum.photos/seed/news/1200/630"}
                          alt="LinkedIn Meta"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ padding: "8px 10px", textAlign: "left" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#191919", lineHeight: "1.3", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {metaTitle || watch("title") || "Article Title Here"}
                        </div>
                        <div style={{ fontSize: 9.5, color: "#666666", textTransform: "lowercase", marginTop: 4 }}>youdie.my.id</div>
                      </div>
                    </div>
                  )}

                  {activeSocialTab === "threads" && (
                    <div style={{
                      background: "#ffffff",
                      border: "1px solid #e5e5e5",
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                    }}>
                      <div style={{ height: 110, width: "100%", overflow: "hidden", background: "#f5f5f5" }}>
                        <img
                          src={featuredImage || "https://picsum.photos/seed/news/1200/630"}
                          alt="Threads preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ padding: "8px 10px", textAlign: "left" }}>
                        <div style={{ fontSize: 10, color: "#999999", textTransform: "lowercase", marginBottom: 2 }}>youdie.my.id</div>
                        <div style={{ fontSize: 12, fontWeight: "bold", color: "#000000", lineHeight: "1.3", marginBottom: 2 }}>
                          {metaTitle || watch("title") || "Article Title Here"}
                        </div>
                        <div style={{ fontSize: 11, color: "#999999", lineHeight: "1.3", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {metaDescription || watch("excerpt") || "Meta description will appear here."}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Panel Footer */}
        <div style={{
          borderTop: "1px solid var(--border)", padding: "12px 16px",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <button
            type="submit"
            form="article-form"
            disabled={saveMutation.isPending}
            style={{
              width: "100%", padding: "9px", borderRadius: 8, border: "none",
              background: "var(--brand)", color: "#fff", cursor: "pointer",
              fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 7, transition: "background 0.1s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--brand-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--brand)"}
          >
            {saveMutation.isPending ? "Saving..." :
              formValues.status === "PUBLISHED" ? <><Send size={14} /> Publish Now</> :
              formValues.status === "SCHEDULED" ? <><Clock size={14} /> Schedule</> :
              <><Save size={14} /> Save Draft</>}
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            {isEditMode ? (
              <button
                type="button"
                onClick={() => {
                  const categorySlug = existingArticle?.category?.slug || "berita";
                  const slug = existingArticle?.slug;
                  if (slug) {
                    window.open(`/preview/${categorySlug}/${slug}`, "_blank");
                  } else {
                    showToast("Gagal memuat pratinjau. Pastikan artikel memiliki slug.", "error");
                  }
                }}
                style={{
                  flex: 1, padding: "8px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "transparent",
                  color: "var(--text-secondary)", cursor: "pointer", fontSize: 12, fontWeight: 500,
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-muted)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Preview ↗
              </button>
            ) : (
              <button
                type="button"
                onClick={() => showToast("Silakan simpan artikel sebagai Draft terlebih dahulu untuk mengaktifkan pratinjau!", "info")}
                style={{
                  flex: 1, padding: "8px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "transparent",
                  color: "var(--text-tertiary)", cursor: "pointer", fontSize: 12, fontWeight: 500,
                  opacity: 0.6,
                }}
                title="Simpan sebagai Draft terlebih dahulu"
              >
                Preview ↗
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/admin/posts")}
              style={{
                flex: 1, padding: "8px", borderRadius: 8,
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--text-secondary)", cursor: "pointer", fontSize: 12, fontWeight: 500,
                transition: "background 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-muted)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Media Library Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMediaModal(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-['Poppins']">Pustaka Media</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Kelola dan pilih gambar utama artikel</p>
              </div>
              <button
                onClick={() => setShowMediaModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* WordPress-style Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 px-6">
              <button
                type="button"
                onClick={() => setActiveMediaTab("upload")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer bg-transparent border-none ${
                  activeMediaTab === "upload"
                    ? "border-[#D60000] text-[#D60000]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Unggah Berkas
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaTab("library")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer bg-transparent border-none ${
                  activeMediaTab === "library"
                    ? "border-[#D60000] text-[#D60000]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Pustaka Media
              </button>
            </div>

            {/* Body */}
            <div className="p-5 max-h-[50vh] overflow-y-auto min-h-[300px] flex flex-col justify-center">
              {activeMediaTab === "upload" ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <ImageIcon size={40} className="text-slate-300 mb-4" />
                  <p className="text-xs font-bold text-slate-700 mb-1">Tarik gambar ke sini untuk mengunggah</p>
                  <p className="text-[10px] text-slate-400 mb-4">atau klik tombol di bawah</p>
                  <label className="px-5 py-2 bg-[#D60000] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-red-700 transition-colors shadow-sm">
                    {isUploadingMedia ? "Mengunggah..." : "Pilih Berkas"}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingMedia}
                      onChange={handleDirectUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <>
                  {!mediaLibrary || mediaLibrary.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      Tidak ada gambar tersedia. Unggah berkas baru terlebih dahulu.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 self-start w-full">
                      {mediaLibrary?.map((media) => (
                        <div
                          key={media.id}
                          onClick={() => setSelectedMediaUrl(media.url)}
                          className={`group relative rounded-xl overflow-hidden cursor-pointer aspect-square bg-slate-100 border-2 transition-all shadow-sm ${
                            selectedMediaUrl === media.url
                              ? "border-[#D60000] ring-4 ring-red-100"
                              : "border-transparent hover:border-slate-200"
                          }`}
                        >
                          <img
                            src={media.url}
                            alt={media.filename}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          {/* Overlay info + delete */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                            {/* Tombol hapus */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Hapus gambar "${media.name || media.filename}"?`)) {
                                  if (selectedMediaUrl === media.url) setSelectedMediaUrl("");
                                  handleDeleteMedia(media.id);
                                }
                              }}
                              className="self-end w-6 h-6 flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white border-none cursor-pointer shadow-sm transition-colors"
                              title="Hapus gambar"
                            >
                              <Trash2 size={11} />
                            </button>
                            {/* Badge status temporary */}
                            <div className="flex items-end justify-between">
                              <span className="text-white text-[8px] font-bold bg-black/60 px-1.5 py-0.5 rounded truncate max-w-[70%]">
                                {media.name || media.filename}
                              </span>
                              {media.isTemporary && (
                                <span className="text-[7px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded ml-1 shrink-0">
                                  TEMP
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Checkmark saat terpilih */}
                          {selectedMediaUrl === media.url && (
                            <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-[#D60000] flex items-center justify-center shadow">
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
              <p className="text-[10px] text-slate-400">
                {activeMediaTab === "library" ? `${mediaLibrary?.length || 0} file tersedia` : "Maksimal ukuran file: 10MB"}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMediaModal(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                >
                  Batal
                </button>
                {activeMediaTab === "library" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedMediaUrl) {
                        setFeaturedImage(selectedMediaUrl);
                        setShowMediaModal(false);
                      }
                    }}
                    disabled={!selectedMediaUrl}
                    className={`text-xs font-bold px-4 py-2 rounded-xl text-white transition-colors border-none cursor-pointer ${
                      selectedMediaUrl
                        ? "bg-[#D60000] hover:bg-red-700 shadow-sm"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Pilih Gambar Utama
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
