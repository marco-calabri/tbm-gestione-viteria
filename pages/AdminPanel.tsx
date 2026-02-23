
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, Database, FileSpreadsheet, AlertCircle, 
  CheckCircle2, Settings2, Info, DownloadCloud, FileQuestion 
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Funzione per generare e scaricare il template Excel corretto
  const downloadTemplate = () => {
    // Gestione robusta dell'importazione esm.sh
    const XLSXLib = (XLSX as any).utils ? XLSX : (XLSX as any).default;
    if (!XLSXLib || !XLSXLib.utils) {
      alert("Libreria Excel non inizializzata correttamente.");
      return;
    }

    const wb = XLSXLib.utils.book_new();

    // 1. Foglio Altezze
    const wsAltezze = XLSXLib.utils.json_to_sheet([
      { "altezza": 3500, "tipo centina": "Centina Intera", "numero pezzi per codice": 48, "BA700197": 48, "note": "Esempio" },
      { "altezza": 3400, "tipo centina": "Centina Intera", "numero pezzi per codice": 48, "BA700197": 48, "note": "" }
    ]);
    XLSXLib.utils.book_append_sheet(wb, wsAltezze, "Altezze");

    // 2. Foglio Moduli
    const wsModuli = XLSXLib.utils.json_to_sheet([
      { "descrizione": "Modulo LB", "quantità": 1, "BA": "BA502856", "note": "Piastra" },
      { "descrizione": "Modulo Centrale", "quantità": 2, "BA": "BA502856", "note": "" }
    ]);
    XLSXLib.utils.book_append_sheet(wb, wsModuli, "Moduli");

    // 3. Foglio Varie
    const wsVarie = XLSXLib.utils.json_to_sheet([
      { "descrizione": "Coclee", "quantità": 4, "BA": "BA700289", "note": "" },
      { "descrizione": "Exit Point", "quantità": 25, "BA": "BA700197", "note": "" }
    ]);
    XLSXLib.utils.book_append_sheet(wb, wsVarie, "Varie");

    // 4. Foglio Curve
    const wsCurve = XLSXLib.utils.json_to_sheet([
      { "descrizione": "Curva 90° (Viti)", "quantità": 175, "BA": "BA700197", "note": "" },
      { "descrizione": "Curva 90° (Piastre)", "quantità": 4, "BA": "BA502856", "note": "" }
    ]);
    XLSXLib.utils.book_append_sheet(wb, wsCurve, "Curve");

    // 5. Foglio Anagrafica Prodotti
    const wsProdotti = XLSXLib.utils.json_to_sheet([
      { "id": "BA700197", "description": "VITE AUTOFILETTANTE PER LEGNO 4x16...", "unit": "pezzi" },
      { "id": "BA700289", "description": "RIVETTO A STRAPPO 3,2x10...", "unit": "pezzi" }
    ]);
    XLSXLib.utils.book_append_sheet(wb, wsProdotti, "Prodotti");

    XLSXLib.writeFile(wb, "TBM_Template_Database.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'products' | 'configs') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const XLSXLib = (XLSX as any).utils ? XLSX : (XLSX as any).default;
        const workbook = XLSXLib.read(data, { type: 'binary' });
        
        if (type === 'products') {
          const sheetName = workbook.SheetNames.find((n: string) => n.toLowerCase().includes('prodott')) || workbook.SheetNames[0];
          const json = XLSXLib.utils.sheet_to_json(workbook.Sheets[sheetName]);
          localStorage.setItem('tbm_products', JSON.stringify(json));
          setImportStatus({ type: 'success', message: `${json.length} prodotti importati con successo.` });
        } else {
          const newConfigs: any[] = [];
          
          if (workbook.Sheets['Altezze']) {
            const dataAltezze = XLSXLib.utils.sheet_to_json(workbook.Sheets['Altezze']);
            newConfigs.push({
              id: 'altezze',
              categoryName: 'Altezze',
              isHeightCategorized: true,
              options: dataAltezze.map((row: any, idx: number) => ({
                id: `h_imp_${idx}`,
                altezza: row['altezza'],
                name: row['tipo centina'],
                multiplier: row['numero pezzi per codice'],
                code: row['BA700197'] || 'BA700197',
                note: row['note'],
                category: 'altezze'
              }))
            });
          }

          if (workbook.Sheets['Moduli']) {
            const dataModuli = XLSXLib.utils.sheet_to_json(workbook.Sheets['Moduli']);
            newConfigs.push({
              id: 'moduli',
              categoryName: 'Moduli',
              options: dataModuli.map((row: any, idx: number) => ({
                id: `mod_imp_${idx}`,
                name: row['nome modulo'] || row['descrizione'],
                multiplier: row['moltiplicatore'] || row['quantità'],
                code: row['codice'] || row['BA'],
                note: row['note'],
                category: 'moduli'
              }))
            });
          }

          if (workbook.Sheets['Varie']) {
            const dataVarie = XLSXLib.utils.sheet_to_json(workbook.Sheets['Varie']);
            newConfigs.push({
              id: 'varie',
              categoryName: 'Varie',
              options: dataVarie.map((row: any, idx: number) => ({
                id: `var_imp_${idx}`,
                name: row['nome componente'] || row['descrizione'],
                multiplier: row['moltiplicatore'] || row['quantità'],
                code: row['codice'] || row['BA'],
                note: row['note'],
                category: 'varie'
              }))
            });
          }

          if (workbook.Sheets['Curve']) {
            const dataCurve = XLSXLib.utils.sheet_to_json(workbook.Sheets['Curve']);
            newConfigs.push({
              id: 'curve',
              categoryName: 'Curve',
              options: dataCurve.map((row: any, idx: number) => ({
                id: `curv_imp_${idx}`,
                name: row['nome curva'] || row['descrizione'],
                multiplier: row['moltiplicatore'] || row['quantità'],
                code: row['codice'] || row['BA'],
                note: row['note'],
                category: 'curve'
              }))
            });
          }

          if (newConfigs.length > 0) {
            localStorage.setItem('tbm_configs', JSON.stringify(newConfigs));
            setImportStatus({ type: 'success', message: `Database configurazioni aggiornato (${newConfigs.length} categorie).` });
          } else {
            setImportStatus({ type: 'error', message: "Nessun foglio valido trovato (Altezze, Moduli, Varie o Curve)." });
          }
        }
      } catch (err) {
        setImportStatus({ type: 'error', message: "Errore durante l'elaborazione. Verifica il formato Excel." });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Amministrazione</h1>
          <p className="text-slate-500 font-medium">Gestione dei database sincronizzati tramite Excel.</p>
        </div>
        <button 
          onClick={downloadTemplate}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <DownloadCloud size={18} />
          Scarica Template Excel
        </button>
      </header>

      {importStatus.type && (
        <div className={`p-5 rounded-2xl flex items-center gap-4 border-2 animate-in fade-in zoom-in duration-300 ${
          importStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {importStatus.type === 'success' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-red-500" />}
          <p className="font-bold">{importStatus.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Database size={120} />
          </div>
          <div className="flex items-center gap-3 text-blue-600 relative z-10">
            <div className="p-2 bg-blue-50 rounded-lg"><Database size={24} /></div>
            <h2 className="text-xl font-black text-slate-900">Anagrafica Codici</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium relative z-10">
            Aggiorna l'elenco principale dei codici BA e le loro descrizioni.
          </p>
          
          <label className="block cursor-pointer relative z-10">
            <div className="mt-4 border-2 border-dashed border-slate-200 rounded-2xl py-12 flex flex-col items-center hover:border-blue-400 hover:bg-blue-50/50 transition-all group/upload">
              <FileSpreadsheet className="text-slate-300 mb-3 group-hover/upload:text-blue-400 transition-colors" size={48} />
              <span className="text-sm font-black text-slate-600 uppercase tracking-widest">Sfoglia file Prodotti</span>
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={e => handleFileUpload(e, 'products')} />
            </div>
          </label>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Settings2 size={120} />
          </div>
          <div className="flex items-center gap-3 text-indigo-600 relative z-10">
            <div className="p-2 bg-indigo-50 rounded-lg"><Settings2 size={24} /></div>
            <h2 className="text-xl font-black text-slate-900">Database Configurazioni</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium relative z-10">
            Importa i parametri di calcolo per Altezze, Moduli, Varie e Curve.
          </p>
          
          <label className="block cursor-pointer relative z-10">
            <div className="mt-4 border-2 border-dashed border-slate-200 rounded-2xl py-12 flex flex-col items-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group/upload">
              <Upload className="text-slate-300 mb-3 group-hover/upload:text-indigo-400 transition-colors" size={48} />
              <span className="text-sm font-black text-slate-600 uppercase tracking-widest">Sfoglia file Config</span>
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={e => handleFileUpload(e, 'configs')} />
            </div>
          </label>
        </section>
      </div>

      <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] space-y-8 shadow-2xl shadow-blue-900/20">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Info className="text-blue-400" /></div>
            Guida alla Struttura Excel
          </h3>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <FileQuestion size={16} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Colonna 'Concatena': Non necessaria</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <p className="font-black text-blue-400 mb-3 uppercase text-xs tracking-widest border-b border-white/10 pb-2">Foglio: Altezze</p>
            <ul className="space-y-2 text-[10px] font-medium text-slate-400">
              <li className="flex justify-between"><span>altezza</span> <span className="text-white">(3500)</span></li>
              <li className="flex justify-between"><span>tipo centina</span> <span className="text-white">Text</span></li>
              <li className="flex justify-between"><span>n° pezzi</span> <span className="text-white">Num</span></li>
              <li className="flex justify-between"><span>BA700197</span> <span className="text-white">Num</span></li>
            </ul>
          </div>
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <p className="font-black text-indigo-400 mb-3 uppercase text-xs tracking-widest border-b border-white/10 pb-2">Foglio: Moduli</p>
            <ul className="space-y-2 text-[10px] font-medium text-slate-400">
              <li className="flex justify-between"><span>descrizione</span> <span className="text-white">Text</span></li>
              <li className="flex justify-between"><span>quantità</span> <span className="text-white">Num</span></li>
              <li className="flex justify-between"><span>codice</span> <span className="text-white">BA...</span></li>
            </ul>
          </div>
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <p className="font-black text-emerald-400 mb-3 uppercase text-xs tracking-widest border-b border-white/10 pb-2">Foglio: Varie</p>
            <ul className="space-y-2 text-[10px] font-medium text-slate-400">
              <li className="flex justify-between"><span>descrizione</span> <span className="text-white">Text</span></li>
              <li className="flex justify-between"><span>quantità</span> <span className="text-white">Num</span></li>
              <li className="flex justify-between"><span>codice</span> <span className="text-white">BA...</span></li>
            </ul>
          </div>
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <p className="font-black text-orange-400 mb-3 uppercase text-xs tracking-widest border-b border-white/10 pb-2">Foglio: Curve</p>
            <ul className="space-y-2 text-[10px] font-medium text-slate-400">
              <li className="flex justify-between"><span>descrizione</span> <span className="text-white">Text</span></li>
              <li className="flex justify-between"><span>quantità</span> <span className="text-white">Num</span></li>
              <li className="flex justify-between"><span>codice</span> <span className="text-white">BA...</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
