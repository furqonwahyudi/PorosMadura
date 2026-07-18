import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../../context/AdminAuthContext";

/**
 * AdminGuard — melindungi semua route /admin/*
 * Redirect ke /admin/login jika belum authenticated
 */
export default function AdminGuard() {
  const { user, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0D2B5C] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
