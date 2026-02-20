import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { TRANSLATIONS, MOCK_REPORTS } from '../constants';
import { Language } from '../types';

const data = [
  { name: 'Mon', queries: 400, compliance: 240 },
  { name: 'Tue', queries: 300, compliance: 139 },
  { name: 'Wed', queries: 200, compliance: 980 },
  { name: 'Thu', queries: 278, compliance: 390 },
  { name: 'Fri', queries: 189, compliance: 480 },
  { name: 'Sat', queries: 239, compliance: 380 },
  { name: 'Sun', queries: 349, compliance: 430 },
];

export const Dashboard: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: '1,284', icon: FolderOpen, color: 'bg-blue-500' },
          { label: 'Avg Compliance', value: '94.2%', icon: Shield, color: 'bg-emerald-500' },
          { label: 'Pending Reviews', value: '12', icon: AlertTriangle, color: 'bg-amber-500' },
          { label: 'Docs Indexed', value: '45.2k', icon: FileText, color: 'bg-indigo-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.color} text-white bg-opacity-90`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">System Activity</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="queries" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorQueries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Reports</h3>
          <div className="space-y-4">
            {MOCK_REPORTS.map((report) => (
              <div key={report.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                  ${report.status === 'compliant' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}
                `}>
                  {report.status === 'compliant' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{report.projectName}</p>
                  <p className="text-xs text-slate-500">{report.date}</p>
                </div>
                <div className="font-bold text-slate-700">{report.score}%</div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
            View All Reports
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple Icon component wrapper for dashboard usage
const FolderOpen = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2" />
  </svg>
);
