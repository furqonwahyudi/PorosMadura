import { LayoutDashboard } from "lucide-react";

/** Placeholder halaman dashboard — akan diisi di Tahap 2 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-2xl bg-[#0D2B5C]/10 flex items-center justify-center">
        <LayoutDashboard size={32} className="text-[#0D2B5C]" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-slate-800 font-['Poppins']">
          Dashboard — Segera Hadir
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Modul dashboard sedang dalam pengerjaan (Tahap 2).
        </p>
      </div>
    </div>
  );
}
