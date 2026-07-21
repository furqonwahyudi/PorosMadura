import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useForm } from "react-hook-form";
import { useDialog } from "../../../context/DialogContext";
import {
  Folder,
  Plus,
  Edit2,
  Trash2,
  FolderOpen,
  Eye,
  Settings,
  X,
  Save,
  Palette,
  Layers,
  ChevronDown
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  parentId?: string | null;
  children?: Category[];
  _count?: {
    articles: number;
  };
}

const PRESET_COLORS = [
  { name: "Navy Blue", value: "#0D2B5C" },
  { name: "Brand Red", value: "#D71920" },
  { name: "Emerald Green", value: "#10B981" },
  { name: "Amber Orange", value: "#F59E0B" },
  { name: "Royal Purple", value: "#8B5CF6" },
  { name: "Sunset Pink", value: "#EC4899" },
  { name: "Sky Cyan", value: "#06B6D4" },
  { name: "Cool Slate", value: "#64748B" }
];

export default function CategoryPage() {
  const queryClient = useQueryClient();
  const { showConfirm, showToast } = useDialog();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);
  const [customColor, setCustomColor] = useState("");

  // Form setup
  const { register, handleSubmit, setValue, reset, watch } = useForm({
    defaultValues: {
      name: "",
      slug: "",
      parentId: "",
      description: "",
      color: PRESET_COLORS[0].value,
      isActive: true
    }
  });

  const categoryNameInput = watch("name");

  // Auto-generate slug from name if not manually editing or in edit mode
  useEffect(() => {
    if (categoryNameInput && !editingCategory) {
      const generatedSlug = categoryNameInput
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("slug", generatedSlug);
    }
  }, [categoryNameInput, setValue, editingCategory]);

  // Fetch Categories list
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["admin", "categories", "all"],
    queryFn: async () => {
      const res = await adminApi.get<{ success: boolean; data: Category[] }>("/api/categories?admin=true");
      return res.data;
    }
  });

  // Flat list of parent categories to select parentId
  const parentOptions = categories || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.post("/api/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      resetForm();
      showToast("Kategori berhasil dibuat!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Gagal membuat kategori.", "error");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminApi.put(`/api/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      resetForm();
      showToast("Kategori berhasil diperbarui!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Gagal memperbarui kategori.", "error");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      showToast("Kategori berhasil dihapus!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Gagal menghapus kategori. Pastikan tidak ada artikel yang terikat.", "error");
    }
  });

  const resetForm = () => {
    setEditingCategory(null);
    setSelectedColor(PRESET_COLORS[0].value);
    setCustomColor("");
    reset({
      name: "",
      slug: "",
      parentId: "",
      description: "",
      color: PRESET_COLORS[0].value,
      isActive: true
    });
  };

  const handleEditClick = (cat: Category) => {
    setEditingCategory(cat);
    setSelectedColor(cat.color || PRESET_COLORS[0].value);
    reset({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId || "",
      description: cat.description || "",
      color: cat.color || PRESET_COLORS[0].value,
      isActive: cat.isActive
    });
  };

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      color: selectedColor || data.color,
      parentId: data.parentId === "" ? null : data.parentId
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-slate-800 font-['Poppins'] tracking-tight">
            Article Categories Hierarchy
          </h2>
          <p className="text-xs text-slate-500">
            Kelola sistem pohon kategori berita, atur warna navigasi, dan konfigurasi optimasi mesin pencari kategori.
          </p>
        </div>
        <button
          onClick={resetForm}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0D2B5C] hover:bg-[#0f3670] active:bg-[#0a2149] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-900/10 cursor-pointer transition-all shrink-0"
        >
          <Plus size={14} /> Tambah Kategori Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Sisi Kiri: Form Add/Edit Category ── */}
        <div className="lg:col-span-1 bg-white border border-slate-100 shadow-sm rounded-2xl p-5 h-fit text-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
            <Layers size={14} className="text-[#0D2B5C]" />
            {editingCategory ? `Edit Kategori: ${editingCategory.name}` : "Tambah Kategori Baru"}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-600">Nama Kategori</label>
              <input
                type="text"
                placeholder="Contoh: Olahraga, Politik..."
                {...register("name")}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0D2B5C] focus:bg-white transition-all text-xs font-medium"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-600">Slug URL</label>
              <input
                type="text"
                placeholder="url-friendly-slug"
                {...register("slug")}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0D2B5C] focus:bg-white transition-all text-xs font-medium"
              />
            </div>

            {/* Parent Category */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-600">Kategori Induk (Parent)</label>
              <select
                {...register("parentId")}
                className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0D2B5C] focus:bg-white cursor-pointer transition-all text-xs font-medium appearance-none"
              >
                <option value="">— Tidak Ada (Kategori Utama) —</option>
                {parentOptions.map((cat) => (
                  <option key={cat.id} value={cat.id} disabled={editingCategory?.id === cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-600">Warna Penanda Kategori</label>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    className={`h-8 rounded-lg border-2 transition-all relative ${
                      selectedColor === color.value
                        ? "border-[#0D2B5C] scale-105 shadow-sm"
                        : "border-transparent opacity-85 hover:opacity-100"
                    }`}
                  >
                    {selectedColor === color.value && (
                      <span className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Palette size={14} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Atau kode hex custom (#ffffff)"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    if (e.target.value.startsWith("#") && e.target.value.length >= 4) {
                      setSelectedColor(e.target.value);
                    }
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none text-[10px] w-full"
                />
              </div>
            </div>

            {/* Description / SEO */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-600">SEO Deskripsi Kategori</label>
              <textarea
                placeholder="Deskripsi singkat yang menggambarkan kategori untuk crawler Google..."
                {...register("description")}
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0D2B5C] focus:bg-white transition-all resize-none text-xs font-medium"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
              {editingCategory && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors font-semibold cursor-pointer shrink-0"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full py-2 bg-[#0D2B5C] hover:bg-[#0f3670] active:bg-[#0a2149] text-white rounded-xl transition-all shadow-md shadow-blue-900/10 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save size={13} />
                {editingCategory ? "Simpan" : "Tambah Kategori"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Sisi Kanan: Hierarchical Data Table ── */}
        <div className="lg:col-span-2 bg-white border border-slate-100 shadow-sm rounded-2xl p-5 text-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
            <FolderOpen size={14} className="text-[#D71920]" />
            Daftar Pohon Kategori & Indentasi Sub-kategori
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 pl-3">Nama Kategori</th>
                  <th className="py-3">Slug URL</th>
                  <th className="py-3 text-center">Warna Badge</th>
                  <th className="py-3 text-center">Artikel Terbit</th>
                  <th className="py-3 pr-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Memuat daftar kategori...
                    </td>
                  </tr>
                ) : categories?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                      Kategori belum ditambahkan.
                    </td>
                  </tr>
                ) : (
                  categories?.flatMap((parent) => {
                    // Create rows array for parent and its sub-categories
                    const rows = [
                      <tr key={parent.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3.5 pl-3 font-bold text-slate-800 flex items-center gap-2">
                          <Folder size={14} className="text-[#0D2B5C] shrink-0" />
                          {parent.name}
                        </td>
                        <td className="py-3.5 text-slate-500 font-medium">
                          {parent.slug}
                        </td>
                        <td className="py-3.5 text-center">
                          <span
                            className="inline-block w-4 h-4 rounded-full border border-slate-200 shadow-xs"
                            style={{ backgroundColor: parent.color || "#0D2B5C" }}
                          />
                        </td>
                        <td className="py-3.5 text-center font-bold text-slate-600">
                          {parent._count?.articles || 0}
                        </td>
                        <td className="py-3.5 pr-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditClick(parent)}
                              className="text-slate-400 hover:text-[#0D2B5C] hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Edit Kategori"
                            >
                              <Edit2 size={13} />
                            </button>
                             <button
                               onClick={() => {
                                 showConfirm(
                                   `Apakah Anda yakin ingin menghapus kategori "${parent.name}"?`,
                                   () => deleteMutation.mutate(parent.id),
                                   "Hapus Kategori",
                                   { type: "danger", confirmText: "Hapus", cancelText: "Batal" }
                                 );
                               }}
                               className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                               title="Hapus Kategori"
                             >
                               <Trash2 size={13} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    ];

                    // Map subcategories
                    parent.children?.forEach((child) => {
                      rows.push(
                        <tr key={child.id} className="bg-slate-50/20 hover:bg-slate-50/50 transition-colors border-l-2 border-slate-100">
                          <td className="py-3 pl-8 text-slate-600 flex items-center gap-2 font-medium">
                            <span className="text-slate-300 select-none">└─</span>
                            <Folder size={12} className="text-[#D71920] shrink-0" />
                            {child.name}
                          </td>
                          <td className="py-3 text-slate-400 font-mono text-[10px]">
                            {child.slug}
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className="inline-block w-3.5 h-3.5 rounded-full border border-slate-200 shadow-xs"
                              style={{ backgroundColor: child.color || "#D71920" }}
                            />
                          </td>
                          <td className="py-3 text-center text-slate-400 font-medium">
                            {child._count?.articles || 0}
                          </td>
                          <td className="py-3 pr-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditClick(child)}
                                className="text-slate-400 hover:text-[#0D2B5C] hover:bg-slate-50 p-1 rounded transition-colors cursor-pointer"
                                title="Edit Sub-kategori"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                               onClick={() => {
                                 showConfirm(
                                   `Apakah Anda yakin ingin menghapus sub-kategori "${child.name}"?`,
                                   () => deleteMutation.mutate(child.id),
                                   "Hapus Sub-kategori",
                                   { type: "danger", confirmText: "Hapus", cancelText: "Batal" }
                                 );
                               }}
                               className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded transition-colors cursor-pointer"
                               title="Hapus Sub-kategori"
                             >
                               <Trash2 size={12} />
                             </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });

                    return rows;
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
