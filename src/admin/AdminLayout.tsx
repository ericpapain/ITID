import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAdminToken, getAdminUser, clearAdminSession, getAuthHeaders } from "./auth";
import logo from "../logos/logo ITID 3.png";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = getAdminToken();
  const user = getAdminUser();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/admin/messages?status=unread&limit=1", { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data?.pagination?.total || 0);
        }
      } catch {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [token, navigate, location.pathname]);

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin/login");
  };

  const navItems = [
    { label: "Tableau de bord", path: "/admin/dashboard", icon: "📊" },
    { label: "Visiteurs & Analytics", path: "/admin/analytics", icon: "📈" },
    { label: "Messages & Leads", path: "/admin/messages", icon: "✉️" },
    { label: "Newsletter & Abonnés", path: "/admin/newsletter", icon: "📬" },
    { label: "Éditeur de Pages (CMS)", path: "/admin/pages", icon: "📑" },
    { label: "Bibliothèque Médias", path: "/admin/media", icon: "🎬" },
  ];

  if (!token) return null;

  return (
    <div className="min-h-screen bg-[#071322] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0a1628] border-r border-slate-800/80 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
          <img src={logo} alt="ITID" className="w-10 h-10 rounded-full border border-[#2a9d8f]/50 object-contain" />
          <div>
            <div className="font-bold text-sm text-white">ITID France</div>
            <div className="text-[10px] text-[#2a9d8f] font-semibold uppercase tracking-wider">Administration</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== "/admin/dashboard" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-[#2a9d8f] text-white shadow-[0_0_15px_rgba(42,157,143,0.3)]"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {item.path === "/admin/messages" && unreadCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-[#081220]">
          <div className="text-xs text-slate-400 truncate mb-1">Connecté en tant que :</div>
          <div className="text-xs font-semibold text-white truncate mb-3">{user?.email || "admin@itid-france.com"}</div>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#0a1628]/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">Système ITID Connecté (Hostinger Ready)</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>Voir le site public</span>
              <span className="text-xs">↗</span>
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
