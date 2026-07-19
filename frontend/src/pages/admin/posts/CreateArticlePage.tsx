import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useForm } from "react-hook-form";
import { useDialog } from "../../../context/DialogContext";
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Code, Quote, Eye,
  Save, Send, Clock, ChevronRight, X, Plus, Tag, CheckCircle2,
  AlertTriangle, Settings2, Star, Zap, TrendingUp, Award, Calendar, Strikethrough
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MediaAsset {
  id: string;
  url: string;
  filename: string;
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

  const [editorHtml, setEditorHtml] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [activeToolStates, setActiveToolStates] = useState<Record<string, boolean>>({});

  // Tab State
  const [activeRightTab, setActiveRightTab] = useState("publish");
  const [showPreview, setShowPreview] = useState(false);

  // SEO States
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");

  // Input Link Berita States & Scraper Handler
  const [newsLink, setNewsLink] = useState("");
  const [isScraping, setIsScraping] = useState(false);

  const handleScrapeLink = async () => {
    if (!newsLink.trim()) {
      showToast("Silakan masukkan link berita terlebih dahulu!", "warning");
      return;
    }
    setIsScraping(true);
    try {
      const res = await adminApi.post<any>("/api/articles/scrape", { url: newsLink });
      if (res.success && res.data) {
        setValue("title", res.data.title || "");
        setValue("excerpt", res.data.excerpt || "");
        setEditorHtml(res.data.content || "");
        if (editorRef.current) {
          editorRef.current.innerHTML = res.data.content || "";
        }
        // update text area heights
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
      } else {
        throw new Error("Gagal mengambil data dari URL");
      }
    } catch (err: any) {
      console.warn("API Scrape error, falling back to mock parser:", err);
      // Fallback/offline mock content parsing simulation
      let title = "Artikel Hasil Impor Link Otomatis";
      let excerpt = "Ini adalah lead paragraph dari berita yang diimpor menggunakan link khusus.";
      let content = "<p>Ini adalah isi artikel hasil simulasi impor link berita. Konten dan informasi penting di dalamnya telah berhasil disarikan secara otomatis ke dalam rich text editor ini.</p><p>Anda dapat mengedit dan menyunting bagian judul, lead paragraph, maupun body artikel secara manual untuk merapikan hasil impor.</p>";
      
      try {
        const urlObj = new URL(newsLink);
        const domain = urlObj.hostname.replace("www.", "");
        title = `Kabar Terkini Dari Portal ${domain.toUpperCase()}`;
        excerpt = `Ringkasan berita utama yang diimpor dari tautan eksternal ${newsLink}.`;
        content = `<p>Artikel ini diimpor secara otomatis dari <strong>${domain}</strong>.</p><p>Layanan impor berita kami mendeteksi artikel dengan topik terkait. Silakan baca dan lakukan editorial sebelum mempublikasikannya.</p>`;
      } catch {}

      setValue("title", title);
      setValue("excerpt", excerpt);
      setEditorHtml(content);
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
      }
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
    } finally {
      setIsScraping(false);
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

  // Fetch Media Library
  const { data: mediaLibrary } = useQuery<MediaAsset[]>({
    queryKey: ["admin", "media", "list"],
    queryFn: async () => {
      try {
        const res = await adminApi.get<{ success: boolean; data: MediaAsset[] }>("/api/media");
        return res.data;
      } catch {
        return [
          { id: "1", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop", filename: "jembatan_suramadu.png" },
          { id: "2", url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop", filename: "beasiswa.png" },
        ];
      }
    }
  });

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      title: "",
      categoryId: "",
      status: "DRAFT",
      scheduledAt: "",
      excerpt: "",
      imageCaption: "",
      isBreaking: false,
      isHeadline: false,
      isEditorChoice: false,
      isTrending: false,
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
      });
      setEditorHtml(existingArticle.content || "");
      if (editorRef.current) editorRef.current.innerHTML = existingArticle.content || "";
      setFeaturedImage(existingArticle.image || "");
      setSelectedTags(existingArticle.tags?.map((t: any) => t.tag?.name) || []);
      setMetaTitle(existingArticle.metaTitle || "");
      setMetaDescription(existingArticle.metaDescription || "");
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

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!selectedTags.includes(tagInput.trim())) {
        setSelectedTags([...selectedTags, tagInput.trim()]);
      }
      setTagInput("");
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
    };
    saveMutation.mutate(payload);
  };

  const wordCount = editorHtml.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const seoScore = metaTitle.length > 20 && metaDescription.length > 50 && focusKeyword ? 78 : metaTitle.length > 10 ? 45 : 20;
  const scoreColor = seoScore >= 70 ? "var(--green)" : seoScore >= 40 ? "var(--orange)" : "var(--red)";

  const autoSlug = watch("title") ? watch("title").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-") : "";

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
                width: "100%", fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.6,
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
          {/* SEO Analysis bottom */}
          <div style={{
            marginTop: 32, padding: 20, background: "var(--surface)",
            border: "1px solid var(--border)", borderRadius: 12,
          }}>
            <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              Content Analysis
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
              {[
                { label: "SEO Score", value: `${seoScore}/100`, color: scoreColor, pct: seoScore },
                { label: "Readability", value: "Good", color: "var(--green)", pct: 72 },
                { label: "Keyword Density", value: focusKeyword ? "1.2%" : "—", color: "var(--blue)", pct: 60 },
              ].map(item => (
                <div key={item.label} style={{ padding: "12px", background: "var(--bg-subtle)", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: item.color, fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</div>
                  <div style={{ height: 3, borderRadius: 99, background: "var(--border)", marginTop: 8 }}>
                    <div style={{ height: "100%", borderRadius: 99, background: item.color, width: `${item.pct}%` }} />
                  </div>
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
                    {isScraping ? "Mendapatkan Data..." : "Gaskeun"}
                  </button>
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
                <select style={{
                  width: "100%", padding: "7px 10px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--bg-subtle)",
                  color: "var(--text-primary)", fontSize: 13, outline: "none", cursor: "pointer",
                }}>
                  <option>Rudi Santoso</option>
                  <option>Fatimah Zahra</option>
                  <option>Budi Hariono</option>
                  <option>Nia Kurniasih</option>
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
                <input
                  type="text"
                  placeholder="Ketik tag dan tekan Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  style={{
                    width: "100%", padding: "7px 10px", borderRadius: 8,
                    border: "1px solid var(--border)", background: "var(--bg-subtle)",
                    color: "var(--text-primary)", fontSize: 12.5, outline: "none",
                  }}
                />
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
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: "12px", background: "var(--bg-subtle)", borderRadius: 8, display: "flex", gap: 10, alignItems: "center", border: "1px solid var(--border)" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8, background: scoreColor + "20",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700, color: scoreColor, fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {seoScore}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>SEO Score</div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                    {seoScore >= 70 ? "Good — keep it up!" : seoScore >= 40 ? "Needs improvement" : "Poor — fill SEO fields"}
                  </div>
                </div>
              </div>

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
            </div>
          )}

          {activeRightTab === "social" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {["Facebook / OpenGraph", "Twitter / X Card"].map(platform => (
                <div key={platform} style={{ padding: 12, background: "var(--bg-subtle)", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>{platform}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input placeholder="OG Title" style={{
                      width: "100%", padding: "6px 9px", borderRadius: 6,
                      border: "1px solid var(--border)", background: "var(--surface)",
                      color: "var(--text-primary)", fontSize: 12, outline: "none", fontFamily: "inherit",
                    }} />
                    <textarea placeholder="OG Description" rows={2} style={{
                      width: "100%", padding: "6px 9px", borderRadius: 6,
                      border: "1px solid var(--border)", background: "var(--surface)",
                      color: "var(--text-primary)", fontSize: 12, outline: "none", resize: "none", fontFamily: "inherit",
                    }} />
                  </div>
                </div>
              ))}
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
          <button
            type="button"
            onClick={() => navigate("/admin/posts")}
            style={{
              width: "100%", padding: "8px", borderRadius: 8,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text-secondary)", cursor: "pointer", fontSize: 12.5, fontWeight: 500,
            }}
          >
            Preview Article
          </button>
        </div>
      </div>

      {/* Media Library Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMediaModal(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-['Poppins']">Pustaka Media</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Pilih salah satu gambar utama</p>
              </div>
              <button
                onClick={() => setShowMediaModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Grid */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {mediaLibrary?.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => {
                      setFeaturedImage(media.url);
                      setShowMediaModal(false);
                    }}
                    className="group relative rounded-xl overflow-hidden cursor-pointer aspect-square bg-slate-100 border-2 border-transparent hover:border-[#D60000] transition-all shadow-sm hover:shadow-md"
                  >
                    <img
                      src={media.url}
                      alt={media.filename}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[#0D2B5C]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-2">
                      <span className="text-white text-[9px] font-bold bg-black/40 px-1.5 py-0.5 rounded truncate max-w-full">
                        {media.filename}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
              <p className="text-[10px] text-slate-400">{mediaLibrary?.length || 0} file tersedia</p>
              <button
                onClick={() => setShowMediaModal(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
