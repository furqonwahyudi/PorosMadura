import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useForm } from "react-hook-form";
import { useDialog } from "../../../context/DialogContext";
import {
  Tag,
  Search,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Merge,
  Save,
  CheckCircle,
  X,
  AlertCircle
} from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export default function TagPage() {
  const queryClient = useQueryClient();
  const { showConfirm, showToast } = useDialog();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  
  // Selection & Merging State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetMergeId, setTargetMergeId] = useState("");

  // Create Tag Form
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      slug: ""
    }
  });

  // Fetch Tags List (Paginated, Searchable)
  const { data: tagData, isLoading: tagsLoading } = useQuery<{
    data: TagItem[];
    pagination: { total: number; totalPages: number; page: number };
  }>({
    queryKey: ["admin", "tags", search, page],
    queryFn: async () => {
      let url = `/api/tags?page=${page}&limit=15`;
      if (search) url += `&q=${encodeURIComponent(search)}`;
      const res = await adminApi.get<any>(url);
      return res;
    }
  });

  // Fetch ALL tags for merge target dropdown
  const { data: allTagsList } = useQuery<TagItem[]>({
    queryKey: ["admin", "tags", "all-list"],
    queryFn: async () => {
      const res = await adminApi.get<any>("/api/tags?limit=100");
      return res.data;
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.post("/api/tags", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
      reset();
      showToast("Tag berhasil dibuat!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Gagal membuat tag.", "error");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/api/tags/${id}`),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
      setSelectedIds(prev => prev.filter(i => i !== id));
      showToast("Tag berhasil dihapus!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Gagal menghapus tag.", "error");
    }
  });

  const mergeMutation = useMutation({
    mutationFn: (data: { sourceTagIds: string[]; targetTagId: string }) =>
      adminApi.post("/api/tags/merge", data),
    onSuccess: () => {
      showToast("Tag berhasil digabungkan!", "success");
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
      setSelectedIds([]);
      setTargetMergeId("");
    },
    onError: (err: any) => {
      showToast(err.message || "Gagal menggabungkan tag.", "error");
    }
  });

  const handleCreate = (data: any) => {
    createMutation.mutate({
      name: data.name,
      slug: data.slug || undefined
    });
  };

  const handleMergeSubmit = () => {
    if (selectedIds.length === 0 || !targetMergeId) return;
    if (selectedIds.includes(targetMergeId)) {
      showToast("Tag tujuan tidak boleh termasuk dalam tag asal yang dipilih.", "warning");
      return;
    }

    showConfirm(
      `Apakah Anda yakin ingin menggabungkan ${selectedIds.length} tag terpilih ke dalam tag target? Semua artikel terkait akan dialihkan.`,
      () => {
        mergeMutation.mutate({
          sourceTagIds: selectedIds,
          targetTagId: targetMergeId
        });
      },
      "Gabungkan Tag",
      { type: "confirm", confirmText: "Gabungkan", cancelText: "Batal" }
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const ids = tagData?.data?.map(t => t.id) || [];
    if (selectedIds.length === ids.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ids);
    }
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-slate-800 font-['Poppins'] tracking-tight">
          Keyword Tags Management
        </h2>
        <p className="text-xs text-slate-500">
          Kelola kata kunci berita (tags cloud), bersihkan redundansi penamaan, dan gabungkan tag duplikat.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Column: Form & Merge Tool ── */}
        <div className="lg:col-span-1 space-y-6 text-xs">
          
          {/* Create Tag */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
              <Plus size={14} className="text-[#0D2B5C]" />
              Tambah Tag Baru
            </h3>
            
            <form onSubmit={handleSubmit(handleCreate)} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block font-bold text-slate-600">Nama Tag</label>
                <input
                  type="text"
                  placeholder="Contoh: Liga Indonesia, Pilkada..."
                  {...register("name")}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0D2B5C] focus:bg-white transition-all text-xs font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-600">Custom Slug (Opsional)</label>
                <input
                  type="text"
                  placeholder="liga-indonesia"
                  {...register("slug")}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0D2B5C] focus:bg-white transition-all text-xs font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-2 bg-[#D71920] hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-bold transition-all shadow-md shadow-red-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save size={13} />
                Tambah Tag
              </button>
            </form>
          </div>

          {/* Tag Merger Tool */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
              <Merge size={14} className="text-[#0D2B5C]" />
              Tag Merger Tool
            </h3>

            {selectedIds.length === 0 ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2 text-slate-400">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed">
                  Pilih beberapa tag di tabel sebelah kanan terlebih dahulu untuk digabungkan.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* List selected source tags */}
                <div className="space-y-1.5">
                  <span className="block font-bold text-slate-600">Tag Asal ({selectedIds.length} terpilih):</span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pl-1">
                    {selectedIds.map(id => {
                      const found = allTagsList?.find(t => t.id === id);
                      return found ? (
                        <span key={id} className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
                          {found.name}
                          <button onClick={() => toggleSelect(id)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                            <X size={10} />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Target tag selector */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600">Gabungkan ke Tag Tujuan (Target):</label>
                  <select
                    value={targetMergeId}
                    onChange={(e) => setTargetMergeId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0D2B5C] focus:bg-white cursor-pointer transition-all text-xs font-medium"
                  >
                    <option value="">— Pilih Tag Target —</option>
                    {allTagsList
                      ?.filter(t => !selectedIds.includes(t.id))
                      ?.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.count} artikel)</option>
                      ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleMergeSubmit}
                  disabled={!targetMergeId || mergeMutation.isPending}
                  className="w-full py-2 bg-[#0D2B5C] hover:bg-[#0f3670] active:bg-[#0a2149] disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-900/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Merge size={13} />
                  Gabungkan Tag Terpilih
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Tag Directory Table ── */}
        <div className="lg:col-span-2 bg-white border border-slate-100 shadow-sm rounded-2xl p-5 text-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-50 pb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Tag size={14} className="text-[#D71920]" />
              Tag Directory Repository
            </h3>
            {/* Search */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 w-full sm:w-60">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari tag..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent text-[11px] text-slate-700 placeholder-slate-400 outline-none w-full font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 pl-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === (tagData?.data?.length || 0) && selectedIds.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-[#0D2B5C] focus:ring-[#0D2B5C]"
                    />
                  </th>
                  <th className="py-3">Nama Tag</th>
                  <th className="py-3">Slug URL</th>
                  <th className="py-3 text-center">Frekuensi Penggunaan</th>
                  <th className="py-3 pr-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                {tagsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Memuat daftar tag...
                    </td>
                  </tr>
                ) : tagData?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                      Tidak ada tag ditemukan.
                    </td>
                  </tr>
                ) : (
                  tagData?.data?.map((tag) => (
                    <tr key={tag.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-3 pl-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(tag.id)}
                          onChange={() => toggleSelect(tag.id)}
                          className="rounded text-[#0D2B5C] focus:ring-[#0D2B5C]"
                        />
                      </td>
                      <td className="py-3 font-bold text-slate-800">
                        {tag.name}
                      </td>
                      <td className="py-3 text-slate-400 font-mono text-[10px]">
                        {tag.slug}
                      </td>
                      <td className="py-3 text-center font-bold text-slate-600">
                        {tag.count} kali
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <button
                          onClick={() => {
                            showConfirm(
                              `Apakah Anda yakin ingin menghapus tag "${tag.name}"?`,
                              () => deleteMutation.mutate(tag.id),
                              "Hapus Tag",
                              { type: "danger", confirmText: "Hapus", cancelText: "Batal" }
                            );
                          }}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Tag"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {tagData && tagData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 bg-white">
              <span className="text-[10px] text-slate-500 font-semibold">
                Menampilkan {tagData.data.length} dari {tagData.pagination.total} tag
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="p-1 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[10px] text-slate-600 font-semibold">
                  Halaman {page} dari {tagData.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, tagData.pagination.totalPages))}
                  disabled={page === tagData.pagination.totalPages}
                  className="p-1 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
