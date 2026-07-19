import React, { useState, useRef, useCallback } from "react";
import { Upload, X, CheckCircle, AlertCircle, File, FileImage, Video, FileText, RefreshCw } from "lucide-react";

interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "success" | "error";
  errorMsg?: string;
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type: string) => {
  if (type.startsWith("image")) return <FileImage size={18} style={{ color: "var(--blue)" }} />;
  if (type.startsWith("video")) return <Video size={18} style={{ color: "var(--purple)" }} />;
  return <FileText size={18} style={{ color: "var(--orange)" }} />;
};

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArr = Array.from(files);
    const newItems: UploadItem[] = fileArr.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      name: file.name,
      size: formatSize(file.size),
      progress: 0,
      status: "uploading" as const,
    }));
    setItems(prev => [...prev, ...newItems]);

    // Simulate upload progress per file
    newItems.forEach(item => {
      const maxSize = item.file.type.startsWith("image") ? 20 * 1024 * 1024 : 200 * 1024 * 1024;
      const isTooBig = item.file.size > maxSize;
      const isWrongType = !["image/jpeg","image/jpg","image/png","image/webp","image/gif","video/mp4","video/mov","application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(item.file.type);

      if (isTooBig || isWrongType) {
        setTimeout(() => {
          setItems(prev => prev.map(i => i.id === item.id
            ? { ...i, progress: 0, status: "error", errorMsg: isTooBig ? "File terlalu besar" : "Format tidak didukung" }
            : i
          ));
        }, 600);
        return;
      }

      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 18 + 5;
        if (prog >= 100) {
          prog = 100;
          clearInterval(interval);
          setItems(prev => prev.map(i => i.id === item.id ? { ...i, progress: 100, status: "success" } : i));
        } else {
          setItems(prev => prev.map(i => i.id === item.id ? { ...i, progress: Math.round(prog) } : i));
        }
      }, 150);
    });
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const onRemove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const onRetry = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, progress: 0, status: "uploading" } : i));
      processFiles([item.file]);
    }
  };
  const clearAll = () => setItems([]);

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Bulk Media Upload Zone
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Unggah aset media untuk perpustakaan konten berita
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? "var(--brand)" : "var(--border)"}`,
          borderRadius: 16,
          background: isDragging ? "var(--brand-subtle)" : "var(--surface)",
          padding: "52px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: isDragging ? "var(--brand)" : "var(--bg-subtle)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
          transition: "all 0.2s",
        }}>
          <Upload size={28} style={{ color: isDragging ? "#fff" : "var(--text-tertiary)" }} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 600, color: isDragging ? "var(--brand)" : "var(--text-primary)", margin: "0 0 6px" }}>
          {isDragging ? "Lepas file di sini" : "Seret & Lepas file ke area ini"}
        </p>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>
          atau klik untuk memilih dari komputer
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { label: "Gambar", detail: "JPG, PNG, WebP, GIF · Maks 20 MB", icon: <FileImage size={13} style={{ color: "var(--blue)" }} /> },
            { label: "Video", detail: "MP4, MOV · Maks 200 MB", icon: <Video size={13} style={{ color: "var(--purple)" }} /> },
            { label: "Dokumen", detail: "PDF, DOC, DOCX · Maks 20 MB", icon: <FileText size={13} style={{ color: "var(--orange)" }} /> },
          ].map(t => (
            <div key={t.label} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", background: "var(--bg-subtle)",
              border: "1px solid var(--border)", borderRadius: 20,
              fontSize: 12, color: "var(--text-secondary)",
            }}>
              {t.icon} <strong style={{ color: "var(--text-primary)" }}>{t.label}</strong>: {t.detail}
            </div>
          ))}
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={e => e.target.files && processFiles(e.target.files)}
          style={{ display: "none" }}
        />
      </div>

      {/* Upload Queue */}
      {items.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px", borderBottom: "1px solid var(--border)",
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              Antrian Upload ({items.length} file)
            </span>
            <button
              onClick={clearAll}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--text-tertiary)" }}
            >
              Bersihkan Semua
            </button>
          </div>

          {/* Header row */}
          <div style={{
            display: "grid", gridTemplateColumns: "32px 1fr 90px 110px 130px 80px",
            gap: 12, padding: "8px 16px",
            background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
          }}>
            {["", "Nama File", "Ukuran", "Status", "Kemajuan", "Aksi"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
            ))}
          </div>

          {items.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: "grid", gridTemplateColumns: "32px 1fr 90px 110px 130px 80px",
                gap: 12, padding: "12px 16px",
                borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
              }}
            >
              {/* Icon */}
              {getFileIcon(item.file.type)}

              {/* Name */}
              <span style={{ fontSize: 13, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.name}
              </span>

              {/* Size */}
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.size}</span>

              {/* Status */}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {item.status === "success" && <><CheckCircle size={13} style={{ color: "var(--green)" }} /><span style={{ fontSize: 12, color: "var(--green)" }}>Sukses</span></>}
                {item.status === "error" && <><AlertCircle size={13} style={{ color: "var(--red)" }} /><span style={{ fontSize: 12, color: "var(--red)" }}>{item.errorMsg}</span></>}
                {item.status === "uploading" && <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Mengunggah...</span>}
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ height: 6, background: "var(--bg-muted)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${item.status === "error" ? 0 : item.progress}%`,
                    background: item.status === "success" ? "var(--green)" : item.status === "error" ? "var(--red)" : "var(--brand)",
                    borderRadius: 99,
                    transition: "width 0.15s",
                  }} />
                </div>
                <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                  {item.status === "error" ? "—" : `${item.progress}%`}
                </span>
              </div>

              {/* Action */}
              <div style={{ display: "flex", gap: 4 }}>
                {item.status === "error" && (
                  <button onClick={() => onRetry(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--blue)", padding: 3 }}>
                    <RefreshCw size={13} />
                  </button>
                )}
                <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 3 }}>
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div style={{
        background: "var(--brand-subtle)", border: "1px solid var(--brand)",
        borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <File size={15} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--brand)", margin: "0 0 2px" }}>Tips Optimasi Unggahan</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
            Gambar akan dikompresi otomatis ke format WebP untuk menghemat bandwidth. Resolusi maksimum 1920px × 1080px.
            Pastikan nama file menggunakan huruf kecil dan tanpa spasi untuk keamanan URL.
          </p>
        </div>
      </div>
    </div>
  );
}
