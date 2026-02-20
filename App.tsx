import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { QAChat } from './components/QAChat';
import { AdminSettings } from './components/AdminSettings';
import { ComplianceChecker } from './components/Compliance';
import { ViewState, Language, UserRole } from './types';
import { Bell, Search, Menu, User } from 'lucide-react';
import { TRANSLATIONS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [role, setRole] = useState<UserRole>('admin'); // 'admin' or 'user' toggle demo
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const t = TRANSLATIONS[lang];

  // Simple Mock Placeholders for views not fully implemented in demo
  const PlaceholderView = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Search size={32} />
      </div>
      <h2 className="text-xl font-bold text-slate-700">{title}</h2>
      <p>This module is available in the full production build.</p>
    </div>
  );

  const UserManagementView = () => (
     <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
            <h3 className="font-bold text-lg text-slate-800">User Management</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs">
                    <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Last Active</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {[1,2,3].map(i => (
                        <tr key={i} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900">User {i}</td>
                            <td className="px-6 py-4">Officer</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span></td>
                            <td className="px-6 py-4">2 hours ago</td>
                            <td className="px-6 py-4 text-right"><button className="text-blue-600 hover:underline">Edit</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
     </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        lang={lang} 
        role={role}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">
              {currentView === 'dashboard' && t.dashboard}
              {currentView === 'qa' && t.qa}
              {currentView === 'search' && t.search}
              {currentView === 'compliance' && t.compliance}
              {currentView === 'admin-settings' && t.adminSettings}
            </h1>
          </div>

          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative group">
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500" size={18} />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Role Toggler (For Demo) */}
            <button 
                onClick={() => setRole(r => r === 'admin' ? 'user' : 'admin')}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors ${role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
            >
                {role === 'admin' ? 'Admin View' : 'User View'}
            </button>

            {/* Language Switcher */}
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-transparent text-sm font-medium text-slate-600 border-none focus:ring-0 cursor-pointer hover:text-blue-600"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
              <option value="zh">ZH</option>
            </select>

            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                SC
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          {currentView === 'dashboard' && <Dashboard lang={lang} />}
          {currentView === 'qa' && <QAChat lang={lang} />}
          {currentView === 'compliance' && <ComplianceChecker />}
          {currentView === 'admin-settings' && <AdminSettings />}
          {currentView === 'admin-users' && <UserManagementView />}
          
          {/* Placeholders for views not fully mocked */}
          {(currentView === 'search' || currentView === 'library' || currentView === 'admin-kb') && (
            <PlaceholderView title={currentView.replace('-', ' ').toUpperCase()} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
