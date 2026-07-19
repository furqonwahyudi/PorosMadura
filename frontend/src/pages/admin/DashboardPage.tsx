import { Construction } from "lucide-react";

/** Generic placeholder for unimplemented admin panels */
export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
      <div className="w-16 h-16 rounded-2xl bg-[#0D2B5C]/10 flex items-center justify-center">
        <Construction size={32} className="text-[#0D2B5C]" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-slate-800 font-['Poppins']">
          Fitur Sedang Dikembangkan
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Halaman ini masih dalam tahap pembangunan oleh tim developer. Silakan hubungi admin untuk info lebih lanjut.
        </p>
      </div>
    </div>
  );
}
