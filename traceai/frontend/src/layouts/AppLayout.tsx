import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, PlusCircle, Target, Eye, Clock,
  FileText, Settings, LogOut, User, ChevronLeft, ChevronRight,
  Shield, Search, Bell
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cases', label: 'Cases', icon: FolderOpen },
  { to: '/cases/new', label: 'New Case', icon: PlusCircle },
  { to: '/leads', label: 'Leads', icon: Target },
  { to: '/sightings', label: 'Sightings', icon: Eye },
  { to: '/timeline', label: 'Timeline', icon: Clock },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#070d1a]">
      {/* Sidebar */}
      <aside className={`flex flex-col border-r border-slate-700/50 bg-slate-900/80 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-700/50">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-white text-lg tracking-wide">TRACE</span>
              <span className="font-bold text-blue-400 text-lg tracking-wide">AI</span>
            </div>
          )}
          <button
            className="ml-auto text-slate-400 hover:text-white transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all duration-150 mb-0.5
                ${isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600/30 border border-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="text-slate-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center gap-4 px-6 py-3 border-b border-slate-700/50 bg-slate-900/50 flex-shrink-0">
          <div className="flex-1 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 w-64">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search cases, leads..."
                className="bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-slate-400 hover:text-white transition-colors p-2">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-7 h-7 bg-blue-600/30 border border-blue-500/30 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <span className="hidden md:block">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
