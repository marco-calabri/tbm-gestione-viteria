
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Settings2, Clock, FileSpreadsheet, Package, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const mockChartData = [
    { name: 'BA700197', qty: 1200 },
    { name: 'BA700289', qty: 850 },
    { name: 'BA502856', qty: 450 },
    { name: 'BA700307', qty: 600 },
    { name: 'BA700275', qty: 600 },
  ];

  const COLORS = ['#9d2d64', '#c0586e', '#d47d63', '#e69d51', '#ffb74d'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Benvenuto, {user?.displayName}</h1>
        <p className="text-slate-500 mt-1">Gestisci i fabbisogni di viteria e componenti per i tuoi progetti.</p>
      </header>

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

          <div className="bg-gradient-to-r from-tbm-magenta to-tbm-sunset rounded-2xl p-8 text-white relative overflow-hidden shadow-lg border border-white/10">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Pronto per un nuovo calcolo?</h2>
              <p className="text-white/80 mb-6 max-w-md">Utilizza il configuratore avanzato per determinare esattamente la quantità di viteria necessaria in base alle specifiche di progetto.</p>
              <Link
                to="/configurator"
                className="inline-flex items-center gap-2 bg-white text-tbm-magenta px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all shadow-md group"
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
              <Link to="/configurator" className="flex items-center gap-3 p-4 rounded-lg bg-tbm-magenta text-white hover:opacity-90 transition-all shadow-sm">
                <Settings2 size={20} />
                <span className="font-medium">Nuova Configurazione</span>
              </Link>
              <Link to="/history" className="flex items-center gap-3 p-4 rounded-lg bg-tbm-rose text-white hover:opacity-90 transition-all shadow-sm">
                <Clock size={20} />
                <span className="font-medium">Vedi Storico</span>
              </Link>
              <button
                onClick={() => alert('Feature in sviluppo')}
                className="flex items-center gap-3 p-4 rounded-lg bg-tbm-coral text-white hover:opacity-90 transition-all shadow-sm text-left"
              >
                <FileSpreadsheet size={20} />
                <span className="font-medium">Esporta Riepilogo Generale</span>
              </button>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-tbm-sunset text-white opacity-80 cursor-default shadow-sm">
                <Package size={20} />
                <span className="font-medium">Gestione Magazzino</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-tbm-sunset-light text-white opacity-80 cursor-default shadow-sm">
                <FileSpreadsheet size={20} />
                <span className="font-medium">Statistiche Avanzate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
