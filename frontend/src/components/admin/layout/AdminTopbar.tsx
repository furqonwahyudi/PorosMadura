import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, Search, LogOut, ChevronDown } from "lucide-react";
import { useAdminAuth } from "../../../context/AdminAuthContext";

interface AdminTopbarProps {
  onMenuToggle: () => void;
  pageTitle: string;
}

export default function AdminTopbar({ onMenuToggle, pageTitle }: AdminTopbarProps) {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-20">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-slate-800 font-['Poppins'] truncate max-w-xs lg:max-w-none">
          {pageTitle}
        </h1>
      </div>

      {/* Right: search + notif + user */}
      <div className="flex items-center gap-2">
        {/* Search bar (desktop only) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 w-52">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari artikel, user..."
            className="bg-transparent text-xs text-slate-600 placeholder-slate-400 outline-none w-full"
          />
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D71920] rounded-full" />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#0D2B5C] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none">
                {user?.name ?? "Admin"}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 capitalize">
                {user?.role?.toLowerCase().replace("_", " ") ?? ""}
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
