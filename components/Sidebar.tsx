import React from 'react';
import { LayoutDashboard, MessageSquare, Search, ShieldCheck, FolderOpen, Settings, Database, Users, LogOut, Hexagon } from 'lucide-react';
import { ViewState, Language, UserRole } from '../types';
import { TRANSLATIONS } from '../constants';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  lang: Language;
  role: UserRole;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, lang, role, isMobileOpen, setIsMobileOpen }) => {
  const t = TRANSLATIONS[lang];

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => {
        setView(view);
        setIsMobileOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} className={currentView === view ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 border-r border-slate-800 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Hexagon className="text-white" size={20} fill="currentColor" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">CNSC Expert</span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
          
          {/* User Section */}
          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Workspace</p>
            <NavItem view="dashboard" icon={LayoutDashboard} label={t.dashboard} />
            <NavItem view="qa" icon={MessageSquare} label={t.qa} />
            <NavItem view="search" icon={Search} label={t.search} />
            <NavItem view="compliance" icon={ShieldCheck} label={t.compliance} />
            <NavItem view="library" icon={FolderOpen} label={t.library} />
          </div>

          {/* Admin Section */}
          {role === 'admin' && (
            <div className="space-y-1">
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Administration</p>
              <NavItem view="admin-settings" icon={Settings} label={t.adminSettings} />
              <NavItem view="admin-kb" icon={Database} label={t.knowledgeBase} />
              <NavItem view="admin-users" icon={Users} label={t.userMgmt} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span className="font-medium text-sm">{t.logout}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
