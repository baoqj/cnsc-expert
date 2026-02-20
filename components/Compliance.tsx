import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, XCircle, ChevronRight, Loader2 } from 'lucide-react';

export const ComplianceChecker: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setReportGenerated(true);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Compliance Audit</h2>
        <p className="text-blue-100">Upload project documentation to automatically check against REGDOC-2.5.2 and other relevant standards.</p>
      </div>

      {!reportGenerated ? (
        <div 
          onClick={handleUpload}
          className="border-3 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
        >
          {isUploading ? (
            <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
          ) : (
            <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud size={32} className="text-blue-600" />
            </div>
          )}
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            {isUploading ? 'Analyzing Document...' : 'Upload PDF / Word Report'}
          </h3>
          <p className="text-slate-500 text-sm">Drag and drop or click to browse</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Analysis Result: Project Alpha-1</h3>
                <p className="text-sm text-slate-500 mt-1">Checked against: REGDOC-2.5.2, CSA N285.0</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                <AlertTriangle size={20} />
                <span className="font-bold">85% Score</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
              Detailed Findings
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { title: 'Containment Boundary Integrity', status: 'pass', desc: 'Section 4.1 meets pressure retention requirements.' },
                { title: 'Emergency Power Supply', status: 'warning', desc: 'Battery backup duration specification is ambiguous (Section 7.2).' },
                { title: 'Seismic Qualification', status: 'pass', desc: 'Analysis complies with updated ground motion response spectra.' },
                { title: 'Fire Protection Systems', status: 'fail', desc: 'Missing redundant suppression path validation in Zone B.' },
              ].map((item, idx) => (
                <div key={idx} className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                   <div className="mt-1">
                    {item.status === 'pass' && <CheckCircle className="text-emerald-500" size={20} />}
                    {item.status === 'warning' && <AlertTriangle className="text-amber-500" size={20} />}
                    {item.status === 'fail' && <XCircle className="text-red-500" size={20} />}
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-800">{item.title}</h4>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setReportGenerated(false)}
              className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium"
            >
              Start New Audit
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">
              Download Full Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
