import React, { useState } from 'react';
import { Save, RefreshCw, Server, Database, Globe, Sliders } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [hybridWeight, setHybridWeight] = useState(0.7);
  const [rerankModel, setRerankModel] = useState('cohere-v3');

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Configuration</h2>
          <p className="text-slate-500 text-sm mt-1">Manage search parameters, models, and data sources.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all active:scale-95">
          <Save size={18} />
          Save Changes
        </button>
      </div>

      {/* RAG Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <Sliders className="text-blue-600" size={20} />
          <h3 className="font-bold text-slate-800">Retrieval & RAG Settings</h3>
        </div>
        
        <div className="p-6 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Hybrid Search Weight (Keyword vs Semantic)
              </label>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase">Keyword</span>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={hybridWeight}
                  onChange={(e) => setHybridWeight(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-xs font-bold text-slate-500 uppercase">Semantic</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 px-1">
                <span>0.0</span>
                <span className="font-mono text-blue-600 font-bold">{hybridWeight}</span>
                <span>1.0</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Rerank Model</label>
              <select 
                value={rerankModel}
                onChange={(e) => setRerankModel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="cohere-v3">Cohere Multilingual v3.0 (Recommended)</option>
                <option value="bge-reranker">BGE Reranker Large</option>
                <option value="none">None (Faster)</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Top-K Retrieval</label>
              <input type="number" defaultValue={20} className="w-full px-4 py-2 rounded-lg border border-slate-300 text-sm" />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Chunk Size</label>
              <input type="number" defaultValue={512} className="w-full px-4 py-2 rounded-lg border border-slate-300 text-sm" />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Overlap</label>
              <input type="number" defaultValue={50} className="w-full px-4 py-2 rounded-lg border border-slate-300 text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Crawler Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="text-indigo-600" size={20} />
            <h3 className="font-bold text-slate-800">Crawler Configuration</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
            Active
          </span>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded text-indigo-600">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">CNSC Official Website</p>
                  <p className="text-xs text-slate-500">nuclearsafety.gc.ca</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <select className="text-xs border-slate-300 rounded py-1 pl-2 pr-6">
                  <option>Daily</option>
                  <option>Weekly</option>
                </select>
                <button className="p-2 text-slate-400 hover:text-blue-600">
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
             <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded text-indigo-600">
                  <Database size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">IAEA Standards Database</p>
                  <p className="text-xs text-slate-500">iaea.org/standards</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <select className="text-xs border-slate-300 rounded py-1 pl-2 pr-6">
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
                <button className="p-2 text-slate-400 hover:text-blue-600">
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
            
            <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 text-sm font-medium hover:border-blue-400 hover:text-blue-600 transition-colors">
              + Add New Source
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
