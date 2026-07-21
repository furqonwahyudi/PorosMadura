import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";
import { Shield, Plus, Trash2, Loader2 } from "lucide-react";

interface BlacklistWord {
  id: string;
  word: string;
  type: string;
  createdAt: string;
}

export default function CommentBlacklistPage() {
  const queryClient = useQueryClient();
  const { confirm, toast } = useDialog();

  const [newWord, setNewWord] = useState("");
  const [wordType, setWordType] = useState("WORD");

  const { data: wordsRes, isLoading } = useQuery<{ success: boolean; data: BlacklistWord[] }>({
    queryKey: ["admin", "blacklist"],
    queryFn: async () => adminApi.get<any>("/api/comments/admin/blacklist"),
  });

  const blacklist = wordsRes?.data || [];

  const addMutation = useMutation({
    mutationFn: async ({ word, type }: { word: string; type: string }) =>
      adminApi.post("/api/comments/admin/blacklist", { word, type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast("success", "Kata terlarang/IP berhasil ditambahkan ke database!");
      setNewWord("");
    },
    onError: (err: any) => toast("error", err.message || "Gagal menambahkan kata terlarang"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => adminApi.delete(`/api/comments/admin/blacklist/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast("success", "Kata terlarang berhasil dihapus!");
    },
    onError: (err: any) => toast("error", err.message || "Gagal menghapus"),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    addMutation.mutate({ word: newWord.trim(), type: wordType });
  };

  const handleDelete = (item: BlacklistWord) => {
    confirm({
      title: "Hapus Kata Terlarang",
      message: `Hapus "${item.word}" dari daftar kata terlarang?`,
      confirmText: "Hapus",
      cancelText: "Batal",
      type: "danger",
      onConfirm: () => deleteMutation.mutate(item.id),
    });
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Forbidden Words &amp; IP Blacklist Management
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Kelola {blacklist.length} kata terlarang &amp; IP address pembatas otomatis di PostgreSQL
        </p>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, padding: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap"
      }}>
        <input
          value={newWord}
          onChange={e => setNewWord(e.target.value)}
          placeholder="Masukkan kata terlarang atau IP Address (Contoh: judi, slot, 45.14.10.x)..."
          style={{
            flex: 1, minWidth: 240, padding: "8px 12px", border: "1px solid var(--border)",
            borderRadius: 8, background: "var(--bg-subtle)", fontSize: 13, color: "var(--text-primary)", outline: "none"
          }}
          required
        />
        <select
          value={wordType}
          onChange={e => setWordType(e.target.value)}
          style={{
            padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8,
            background: "var(--bg-subtle)", fontSize: 13, color: "var(--text-primary)", outline: "none", cursor: "pointer"
          }}
        >
          <option value="WORD">Kata Terlarang (Word)</option>
          <option value="IP">IP Address</option>
        </select>
        <button
          type="submit"
          disabled={addMutation.isPending}
          style={{
            padding: "8px 16px", background: "var(--brand)", border: "none", borderRadius: 8,
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
          }}
        >
          {addMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Tambah Blacklist
        </button>
      </form>

      {/* List */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0", color: "var(--text-secondary)", fontSize: 13, alignItems: "center" }}>
          <Loader2 className="animate-spin" size={16} style={{ marginRight: 8 }} />
          Memuat daftar blacklist dari database...
        </div>
      ) : blacklist.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-secondary)", fontSize: 13 }}>
          Belum ada kata terlarang atau IP yang didaftarkan di database PostgreSQL.
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 180px 80px", padding: "10px 16px", background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
            <span>Kata / IP Terlarang</span>
            <span>Tipe</span>
            <span>Tanggal Ditambahkan</span>
            <span>Aksi</span>
          </div>
          {blacklist.map((item, i) => (
            <div key={item.id} style={{
              display: "grid", gridTemplateColumns: "1fr 120px 180px 80px", padding: "12px 16px", alignItems: "center",
              borderBottom: i < blacklist.length - 1 ? "1px solid var(--border)" : "none"
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.word}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, width: "fit-content",
                background: item.type === "IP" ? "var(--purple-subtle)" : "var(--red-subtle)",
                color: item.type === "IP" ? "var(--purple)" : "var(--red)"
              }}>{item.type}</span>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <button
                onClick={() => handleDelete(item)}
                style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--red)", cursor: "pointer", width: "fit-content" }}
                title="Hapus"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
