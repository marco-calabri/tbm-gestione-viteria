
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Settings2, Clock, FileSpreadsheet, Package, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [codici, setCodici] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('./Database/Codici.json')
      .then(res => res.json())
      .then(data => setCodici(data))
      .catch(err => console.error("Errore nel caricamento codici:", err));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Benvenuto, {user?.displayName}</h1>
        <p className="text-slate-500 mt-1">Gestisci i fabbisogni di viteria e componenti per i tuoi progetti.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Package className="text-tbm-magenta" size={20} />
              Codici Viteria di Riferimento
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Codice</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Descrizione</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Categoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {codici.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-bold text-tbm-magenta">{item.codice}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 leading-tight">{item.descrizione}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                          {item.categoria}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
