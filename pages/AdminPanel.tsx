
import * as React from 'react';
import { useState } from 'react';
import {
  AlertCircle, CheckCircle2, Info, FileJson, Download, Upload
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const handleJsonDownload = async (filename: string) => {
    try {
      const response = await fetch(`./Database/${filename}`);
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Errore nello scaricamento di ${filename}`);
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>, filename: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        JSON.parse(content); // Valida il JSON
        const storageKey = `tbm_db_${filename.toLowerCase().replace('.json', '')}`;
        localStorage.setItem(storageKey, content);
        setImportStatus({ type: 'success', message: `${filename} caricato correttamente nel database locale.` });

        // Forza un ricaricamento della pagina dopo 1.5s per rendere effettive le modifiche se necessario
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        setImportStatus({ type: 'error', message: `File ${filename} non valido. Assicurati che sia un JSON corretto.` });
      }
    };
    reader.readAsText(file);
  };

  const jsonFiles = [
    { name: 'AltezzeDB.json', label: 'Tabella Altezze' },
    { name: 'CurveDB.json', label: 'Tabella Curve' },
    { name: 'ModuliDB.json', label: 'Tabella Moduli' },
    { name: 'VarieDB.json', label: 'Tabella Varie' },
    { name: 'Utenti.json', label: 'Tabella Utenti' },
    { name: 'Codici.json', label: 'Tabella Codici' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Amministrazione</h1>
        <p className="text-slate-500 font-medium">Gestione diretta dei database di sistema in formato JSON.</p>
      </header>

      {importStatus.type && (
        <div className={`p-5 rounded-2xl flex items-center gap-4 border-2 animate-in fade-in zoom-in duration-300 ${importStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
          {importStatus.type === 'success' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-red-500" />}
          <p className="font-bold">{importStatus.message}</p>
        </div>
      )}

      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-tbm-magenta">
            <div className="p-2 bg-tbm-magenta/10 rounded-lg"><FileJson size={24} /></div>
            <h2 className="text-xl font-black text-slate-900">Gestione Database JSON</h2>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <Info size={16} className="text-tbm-magenta" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">I file caricati hanno priorità sui default</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jsonFiles.map(file => (
            <div key={file.name} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-tbm-magenta transition-colors">{file.label}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{file.name}</p>
                </div>
                <button
                  onClick={() => handleJsonDownload(file.name)}
                  className="p-2 text-tbm-magenta hover:bg-white rounded-lg transition-all shadow-sm"
                  title="Scarica JSON corrente"
                >
                  <Download size={18} />
                </button>
              </div>

              <label className="block">
                <div className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center cursor-pointer hover:border-tbm-magenta hover:text-tbm-magenta transition-all flex items-center justify-center gap-2">
                  <Upload size={14} />
                  Carica nuovo JSON
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={e => handleJsonUpload(e, file.name)}
                  />
                </div>
              </label>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] space-y-6 shadow-2xl">
        <h3 className="text-xl font-black flex items-center gap-3 italic">
          <div className="p-2 bg-tbm-sunset/20 rounded-lg"><AlertCircle className="text-tbm-sunset" /></div>
          Avviso Importante
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          Il sistema Excel è stato dismesso in favore della <span className="text-white font-bold">Gestione JSON</span> per garantire la massima coerenza dei dati.
          Per modificare il database, ti consigliamo di:
        </p>
        <ol className="list-decimal list-inside space-y-3 text-slate-300 text-sm font-medium">
          <li>Scaricare il file <span className="text-tbm-sunset">.json</span> desiderato tramite il pulsante <Download size={14} className="inline mx-1" /></li>
          <li>Modificare il file utilizzando un editor di testo (es. Notepad++ o VS Code)</li>
          <li>Ricaricare il file modificato tramite il tasto <span className="text-white font-bold">"Carica nuovo JSON"</span></li>
        </ol>
      </div>
    </div>
  );
};
