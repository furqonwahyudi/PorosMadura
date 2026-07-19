import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Newspaper, AlertCircle, Loader2 } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname ?? "/admin/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setServerError(err.message ?? "Login gagal. Periksa email dan password.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D2B5C] via-[#0f3670] to-[#1a4a8a] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/3 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#D71920]/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/2 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header stripe */}
          <div className="bg-gradient-to-r from-[#0D2B5C] to-[#1a4a8a] px-8 py-8 text-center">
            <div className="w-14 h-14 bg-[#D71920] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/30">
              <Newspaper size={26} className="text-white" />
            </div>
            <h1 className="text-white text-xl font-bold font-['Poppins'] leading-tight">
              Poros Madura
            </h1>
            <p className="text-white/60 text-xs mt-1 font-medium tracking-wide uppercase">
              CMS Admin Panel
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <p className="text-slate-700 font-semibold text-sm mb-6 text-center">
              Masuk ke akun redaksi Anda
            </p>

            {serverError && (
              <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg mb-5">
                <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-600 leading-relaxed">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="redaksi@porosmadura.com"
                  {...register("email")}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg outline-none transition-all
                    focus:bg-white focus:border-[#0D2B5C] focus:ring-2 focus:ring-[#0D2B5C]/10
                    ${errors.email ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register("password")}
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg outline-none transition-all pr-10
                      focus:bg-white focus:border-[#0D2B5C] focus:ring-2 focus:ring-[#0D2B5C]/10
                      ${errors.password ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                id="admin-login-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#0D2B5C] hover:bg-[#0f3670] active:bg-[#0a2149] text-white text-sm font-semibold rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Masuk...
                  </>
                ) : (
                  "Masuk ke Dashboard"
                )}
              </button>
            </form>

            {/* Dev Account Helper Panel */}
            <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-['Poppins']">
                Development Credentials:
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Email:</span>
                  <span className="font-mono text-slate-700 font-semibold select-all bg-white px-1.5 py-0.5 rounded border border-slate-100">admin@porosmadura.com</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Password:</span>
                  <span className="font-mono text-slate-700 font-semibold select-all bg-white px-1.5 py-0.5 rounded border border-slate-100">Admin@PorosMadura2026</span>
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-400 mt-5">
              Hanya untuk anggota tim redaksi Poros Madura
            </p>
          </div>
        </div>

        {/* Back to portal link */}
        <p className="text-center mt-5">
          <a
            href="/"
            className="text-white/60 text-xs hover:text-white transition-colors"
          >
            ← Kembali ke Portal Berita
          </a>
        </p>
      </div>
    </div>
  );
}
