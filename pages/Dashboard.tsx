
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Settings2, Clock, FileSpreadsheet, Package, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const mockStats = [
    { label: 'Calcoli Salvati', value: '24', icon: <Clock className="text-blue-500" /> },
    { label: 'Prodotti nel Database', value: '1,200', icon: <Package className="text-emerald-500" /> },
    { label: 'Esportazioni Mese', value: '12', icon: <FileSpreadsheet className="text-orange-500" /> },
  ];

  const mockChartData = [
    { name: 'BA700197', qty: 1200 },
    { name: 'BA700289', qty: 850 },
    { name: 'BA502856', qty: 450 },
    { name: 'BA700307', qty: 600 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Benvenuto, {user?.displayName}</h1>
        <p className="text-slate-500 mt-1">Gestisci i fabbisogni di viteria e componenti per i tuoi progetti.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold mb-6">Codici più utilizzati (Ultimi 30gg)</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="qty" radius={[4, 4, 0, 0]}>
                    {mockChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Pronto per un nuovo calcolo?</h2>
              <p className="text-blue-100 mb-6 max-w-md">Utilizza il configuratore avanzato per determinare esattamente la quantità di viteria necessaria in base alle specifiche di progetto.</p>
              <Link 
                to="/configurator" 
                className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition-all shadow-md group"
              >
                Inizia Configurazione
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
            <h2 className="text-lg font-bold mb-4">Azioni Rapide</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link to="/configurator" className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors border border-transparent hover:border-blue-100">
                <Settings2 size={20} />
                <span className="font-medium">Nuova Configurazione</span>
              </Link>
              <Link to="/history" className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors border border-transparent hover:border-blue-100">
                <Clock size={20} />
                <span className="font-medium">Vedi Storico</span>
              </Link>
              <button onClick={() => alert('Feature in sviluppo')} className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors border border-transparent hover:border-blue-100 text-left">
                <FileSpreadsheet size={20} />
                <span className="font-medium">Esporta Riepilogo Generale</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
