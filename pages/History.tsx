
import React, { useState, useEffect } from 'react';
import { Clock, Search, FileText, Trash2, ExternalLink, ChevronRight } from 'lucide-react';

export const History: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('tbm_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const deleteEntry = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('tbm_history', JSON.stringify(updated));
  };

  const filtered = history.filter(h => 
    h.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Storico Calcoli</h1>
          <p className="text-slate-500">Visualizza e gestisci i tuoi progetti salvati.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cerca per nome..."
            className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-4">
            <Clock size={48} className="mx-auto opacity-20" />
            <p>Nessun calcolo trovato.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors group">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">{item.label}</h3>
                    <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-500 font-medium">
                      {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {item.results.slice(0, 3).map((r: any, idx: number) => (
                      <span key={idx} className="text-xs text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">
                        {r.code}: <span className="font-bold">{r.total}</span>
                      </span>
                    ))}
                    {item.results.length > 3 && (
                      <span className="text-xs text-slate-400 px-2 py-1">+{item.results.length - 3} altri...</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => alert('Visualizzazione dettaglio...')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <ExternalLink size={20} />
                  </button>
                  <button 
                    onClick={() => deleteEntry(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
