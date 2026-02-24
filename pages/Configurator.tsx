import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx-js-style';
import { ConfigCategory, Product, ConfigOption } from '../types';
import {
  Calculator, Save, ChevronRight, Info,
  FileSpreadsheet, Layers, Ruler, Box, Package, CornerUpRight,
  Table as TableIcon, Download, FileJson
} from 'lucide-react';

const INITIAL_PRODUCTS: Product[] = [
  { id: 'BA700197', description: 'VITE AUTOFILETTANTE PER LEGNO 4x16 TESTA BOMBATA INSERTO TORX ZN', unit: 'pezzi' },
  { id: 'BA700289', description: 'RIVETTO A STRAPPO 3,2x10 ENISO15977 AL/ZN', unit: 'pezzi' },
  { id: 'BA502856', description: "PIASTRA D'ASSEMBLAGGIO RETTANGOLARE ZN 70x35", unit: 'pezzi' },
  { id: 'BA700307', description: 'VITE AUTOFILETTANTE PER LEGNO 3x10 TESTA BOMBATA TCB RW 10 A2K 3x10/8.5', unit: 'pezzi' },
  { id: 'BA700275', description: 'VITE TRILOBATA M6x30 TESTA SVASATA INSERTO TORX DIN7500 ZN', unit: 'pezzi' },
];

const MAIN_CODES = ['BA700197', 'BA700289', 'BA502856', 'BA700307', 'BA700275'];

const getGroupName = (name: string, category?: string) => {
  if (category === 'curve') {
    if (name.includes('90°')) return 'Curva 90°';
    if (name.includes('180°')) return 'Curva 180°';
  }
  return name;
};

const INITIAL_CONFIGS: ConfigCategory[] = [
  { id: 'altezze', categoryName: 'Altezze', isHeightCategorized: true, options: [] },
  { id: 'moduli', categoryName: 'Moduli', isHeightCategorized: true, options: [] },
  { id: 'curve', categoryName: 'Curve', isHeightCategorized: true, options: [] },
  { id: 'varie', categoryName: 'Varie', options: [] }
];

export const Configurator: React.FC = () => {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<ConfigCategory[]>(() => {
    const saved = localStorage.getItem('tbm_configs');
    return saved ? JSON.parse(saved) : INITIAL_CONFIGS;
  });

  const [products] = useState<Product[]>(() => {
    const saved = localStorage.getItem('tbm_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const { state } = useLocation();
  const projectToLoad = state?.project;

  const [activeCategory, setActiveCategory] = useState<string>('altezze');
  const [selectedHeight, setSelectedHeight] = useState<string>(projectToLoad?.meta?.height || '3500');
  const [selections, setSelections] = useState<Record<string, number>>(projectToLoad?.selections || {});
  const [label, setLabel] = useState<string>(projectToLoad?.label || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadedFromHistory, setIsLoadedFromHistory] = useState(!!projectToLoad);

  useEffect(() => {
    const loadDatabases = async () => {
      try {
        const fetchDB = async (name: string) => {
          const local = localStorage.getItem(`tbm_db_${name.toLowerCase().replace('.json', '')}`);
          if (local) return JSON.parse(local);
          const res = await fetch(`./Database/${name}`);
          return res.json();
        };

        const [dataAltezze, dataModuli, dataVarie, dataCurve] = await Promise.all([
          fetchDB('AltezzeDB.json'),
          fetchDB('ModuliDB.json'),
          fetchDB('VarieDB.json'),
          fetchDB('CurveDB.json')
        ]);

        const mapData = (data: any[], catId: string, defaultCode?: string) =>
          data.map((item: any, idx: number) => ({
            id: `${catId}_${idx}`,
            altezza: item.altezza,
            name: item.tipo,
            code: item.codice || defaultCode || 'BA700197',
            multiplier: item.val,
            category: catId
          }));

        setConfigs(prev => prev.map(cat => {
          if (cat.id === 'altezze') return { ...cat, options: mapData(dataAltezze, 'altezze', 'BA700197') };
          if (cat.id === 'moduli') return { ...cat, options: mapData(dataModuli, 'moduli', 'BA502856') };
          if (cat.id === 'curve') return { ...cat, options: mapData(dataCurve, 'curve') };
          if (cat.id === 'varie') return { ...cat, options: mapData(dataVarie, 'varie') };
          return cat;
        }));
      } catch (err) {
        console.error("Errore caricamento DB", err);
      }
    };
    loadDatabases();
  }, []);

  useEffect(() => {
    if (configs[0].options.length === 0) return;

    if (isLoadedFromHistory) {
      setIsLoadedFromHistory(false); // Reset per permettere cambi altezza futuri
      return;
    }

    const newSelections: Record<string, number> = {};
    const altezzeCat = configs.find(c => c.id === 'altezze');
    const moduliCat = configs.find(c => c.id === 'moduli');

    if (altezzeCat) {
      altezzeCat.options.forEach(opt => {
        if (opt.altezza?.toString() === selectedHeight) {
          if ((opt.name === "Centina Laterale con Porta" || opt.name === "Centina Laterale Standard") && opt.multiplier > 0) {
            newSelections[opt.id] = 1;
            const modName = opt.name.replace('Centina', 'Modulo');
            const targetModulo = moduliCat?.options.find(m => m.name === modName && m.altezza?.toString() === selectedHeight);
            if (targetModulo && targetModulo.multiplier > 0) {
              newSelections[targetModulo.id] = 1;
            }
          }
        }
      });
    }

    // Applichiamo la formula anche all'inizializzazione
    const getValInit = (name: string, catId: string) => {
      const opt = configs.find(c => c.id === catId)?.options.find(
        o => o.name === name && o.altezza?.toString() === selectedHeight
      );
      return opt ? newSelections[opt.id] || 0 : 0;
    };

    const sumCentine =
      getValInit("Centina Intera", "altezze") +
      getValInit("Centina Spezzata", "altezze") +
      getValInit("Centina Laterale con Porta", "altezze") +
      getValInit("Centina Laterale Standard", "altezze");

    const sumModuliAltri =
      getValInit("Modulo LB", "moduli") +
      getValInit("Modulo Laterale con Porta", "moduli") +
      getValInit("Modulo Laterale Standard", "moduli");

    const moduloCentraleOpt = moduliCat?.options.find(o => o.name === "Modulo Centrale" && o.altezza?.toString() === selectedHeight);
    if (moduloCentraleOpt) {
      newSelections[moduloCentraleOpt.id] = Math.max(0, sumCentine - sumModuliAltri - 1);
    }

    setSelections(newSelections);
  }, [selectedHeight, configs]);

  const availableHeights = useMemo(() => {
    const heights = new Set<string>();
    configs.find(c => c.id === 'altezze')?.options.forEach(o => o.altezza && heights.add(o.altezza.toString()));
    return Array.from(heights).sort((a, b) => parseInt(b) - parseInt(a));
  }, [configs]);

  const currentCategory = useMemo(() => configs.find(c => c.id === activeCategory), [configs, activeCategory]);

  const filteredOptions = useMemo(() => {
    if (!currentCategory) return [];
    let opts = currentCategory.options;
    if (currentCategory.isHeightCategorized) {
      opts = opts.filter(opt => opt.altezza?.toString() === selectedHeight);
    }

    if (activeCategory === 'curve') {
      const uniqueGroups: ConfigOption[] = [];
      const seen = new Set();
      opts.forEach(opt => {
        const gName = getGroupName(opt.name, 'curve');
        if (!seen.has(gName)) {
          seen.add(gName);
          uniqueGroups.push({ ...opt, name: gName });
        }
      });
      return uniqueGroups;
    }

    return opts;
  }, [currentCategory, selectedHeight, activeCategory]);

  const projectRows = useMemo(() => {
    const groupedData: Record<string, any> = {};

    configs.forEach(cat => {
      cat.options.forEach(opt => {
        const qty = selections[opt.id] || 0;
        if (qty <= 0 || opt.multiplier <= 0) return;

        const gName = getGroupName(opt.name, cat.id);
        const groupKey = `${cat.id}-${gName}-${opt.altezza || 'all'}`;

        if (!groupedData[groupKey]) {
          groupedData[groupKey] = {
            id: opt.id,
            categoria: cat.categoryName,
            riferimento: gName,
            pezzi: qty,
            distribuzione: {}
          };
        }

        const code = opt.code;
        groupedData[groupKey].distribuzione[code] = (groupedData[groupKey].distribuzione[code] || 0) + (qty * opt.multiplier);
      });
    });

    return Object.values(groupedData);
  }, [selections, configs, selectedHeight]);

  const totalsByCode = useMemo(() => {
    const totals: Record<string, number> = {};
    projectRows.forEach(row => {
      Object.entries(row.distribuzione).forEach(([code, val]) => {
        totals[code] = (totals[code] || 0) + (val as number);
      });
    });

    // Logica Punto 1: Sottrazione viti pannelli (BA700307) dal totale viti standard (BA700197)
    if (totals['BA700307'] && totals['BA700197']) {
      totals['BA700197'] = Math.max(0, totals['BA700197'] - totals['BA700307']);
    }

    return totals;
  }, [projectRows]);

  const distintaComponenti = useMemo(() => {
    return MAIN_CODES.map((code, index) => {
      const product = products.find(p => p.id === code);
      return {
        'Elemento': index + 1,
        'Struttura distinta componenti': 'Acquistato',
        'QTÀ': totalsByCode[code] || 0,
        'Descrizione': product?.description || '',
        'Codice': code,
        'Configurazione': code,
        'Revisione': '',
        'Fornitore': 'BULLONERIA',
        'Ordinare': 'X',
        'Consegna Disegni': '',
        'File STEP': '',
        'File Comune': ''
      };
    });
  }, [totalsByCode, products]);

  const handleInputChange = (optionId: string, value: string) => {
    const num = parseInt(value);
    const val = isNaN(num) ? 0 : Math.max(0, num);

    setSelections(prev => {
      const next = { ...prev };
      const changedOpt = configs.flatMap(c => c.options).find(o => o.id === optionId);
      if (!changedOpt) return next;

      const gName = getGroupName(changedOpt.name, changedOpt.category);
      const optionsToSync = configs.flatMap(c => c.options).filter(o =>
        o.category === changedOpt.category &&
        getGroupName(o.name, o.category) === gName &&
        o.altezza === changedOpt.altezza
      );

      optionsToSync.forEach(o => { next[o.id] = val; });

      if (changedOpt.category === 'altezze') {
        const moduloName = changedOpt.name.replace('Centina', 'Modulo');
        const targetModulo = configs.find(c => c.id === 'moduli')?.options.find(
          o => o.name === moduloName && o.altezza?.toString() === selectedHeight
        );
        if (targetModulo && targetModulo.multiplier > 0) {
          next[targetModulo.id] = val;
        }
      }

      // Nuova logica: Calcolo automatico Modulo Centrale
      // Formula: ((Centina Intera + Centina Spezzata + Centina Laterale con Porta + Centina Laterale Standard) 
      //           - (Modulo LB + Modulo Laterale con Porta + Modulo Laterale Standard)) - 1
      const altezzeOptions = configs.find(c => c.id === 'altezze')?.options || [];
      const moduliOptions = configs.find(c => c.id === 'moduli')?.options || [];

      const getVal = (name: string, options: ConfigOption[]) => {
        const opt = options.find(o => o.name === name && o.altezza?.toString() === selectedHeight);
        return opt ? next[opt.id] || 0 : 0;
      };

      const sumCentine =
        getVal("Centina Intera", altezzeOptions) +
        getVal("Centina Spezzata", altezzeOptions) +
        getVal("Centina Laterale con Porta", altezzeOptions) +
        getVal("Centina Laterale Standard", altezzeOptions);

      const sumModuliAltri =
        getVal("Modulo LB", moduliOptions) +
        getVal("Modulo Laterale con Porta", moduliOptions) +
        getVal("Modulo Laterale Standard", moduliOptions);

      const moduloCentraleOpt = moduliOptions.find(o => o.name === "Modulo Centrale" && o.altezza?.toString() === selectedHeight);
      if (moduloCentraleOpt) {
        next[moduloCentraleOpt.id] = Math.max(0, sumCentine - sumModuliAltri - 1);
      }

      return next;
    });
  };

  const exportExcel = () => {
    // Gestione robusta dell'importazione esm.sh
    const XLSXLib = XLSX as any;
    if (!XLSXLib || !XLSXLib.utils) {
      alert("Libreria Excel non inizializzata correttamente. Riprova.");
      return;
    }

    const filteredDistinta = distintaComponenti.filter(row => row.QTÀ > 0);
    if (filteredDistinta.length === 0) {
      alert("Nessun componente con quantità maggiore di zero da esportare.");
      return;
    }

    const ws = XLSXLib.utils.json_to_sheet(filteredDistinta);

    // Formattazione
    const range = XLSXLib.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSXLib.utils.encode_cell({ c: C, r: R });
        if (!ws[cellRef]) continue;

        ws[cellRef].s = {
          font: { name: "Tahoma", sz: 8, bold: R === 0 },
          alignment: { vertical: "center", horizontal: "left", wrapText: false },
          fill: R === 0 ? { fgColor: { rgb: "F1F5F9" } } : undefined,
          border: {
            top: { style: "thin", color: { rgb: "E2E8F0" } },
            bottom: { style: "thin", color: { rgb: "E2E8F0" } },
            left: { style: "thin", color: { rgb: "E2E8F0" } },
            right: { style: "thin", color: { rgb: "E2E8F0" } }
          }
        };
      }
    }

    const keys = Object.keys(filteredDistinta[0]);
    ws['!cols'] = keys.map(key => {
      let maxLen = key.toString().length;
      filteredDistinta.forEach(row => {
        const val = row[key as keyof typeof row];
        if (val) {
          const len = val.toString().length;
          if (len > maxLen) maxLen = len;
        }
      });
      return { wch: maxLen + 4 };
    });

    const wb = XLSXLib.utils.book_new();
    XLSXLib.utils.book_append_sheet(wb, ws, "Distinta");
    XLSXLib.writeFile(wb, `TBM_Distinta_${label || 'Progetto'}.xlsx`);
  };

  const handleSave = async () => {
    if (!label.trim()) return alert('Inserire un nome progetto');
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const history = JSON.parse(localStorage.getItem('tbm_history') || '[]');
    localStorage.setItem('tbm_history', JSON.stringify([{
      id: Date.now().toString(),
      label,
      timestamp: Date.now(),
      results: Object.entries(totalsByCode).map(([code, total]) => ({
        code, total, description: products.find(p => p.id === code)?.description || ''
      })),
      selections,
      meta: { height: selectedHeight }
    }, ...history]));
    navigate('/history');
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tbm-magenta text-white rounded-xl"><Calculator /></div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Elaborazione Progetto</h1>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Ruler size={18} className="text-tbm-magenta" />
              <span className="text-xs font-bold text-slate-400 uppercase">Altezza Progetto:</span>
              <select
                className="font-bold text-tbm-magenta outline-none cursor-pointer bg-transparent"
                value={selectedHeight}
                onChange={e => setSelectedHeight(e.target.value)}
              >
                {availableHeights.map(h => <option key={h} value={h}>{h} mm</option>)}
              </select>
            </div>
            <input
              type="text"
              placeholder="Nome Commessa / Cantiere..."
              className="px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-medium min-w-[250px] shadow-sm"
              value={label}
              onChange={e => setLabel(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Categorie Database</p>
            {configs.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeCategory === cat.id ? 'bg-tbm-magenta text-white shadow-lg shadow-tbm-magenta/20' : 'text-slate-500 hover:bg-white hover:shadow-sm'
                  }`}
              >
                {cat.id === 'altezze' && <Ruler size={18} />}
                {cat.id === 'moduli' && <Box size={18} />}
                {cat.id === 'curve' && <CornerUpRight size={18} />}
                {cat.id === 'varie' && <Package size={18} />}
                {cat.categoryName}
              </button>
            ))}
          </div>

          <div className="flex-grow p-6 lg:p-10 bg-white">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <div key={opt.id} className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 group ${opt.multiplier === 0
                    ? 'bg-slate-50/50 border-slate-100 grayscale opacity-60'
                    : 'border-slate-100 hover:border-tbm-magenta/50 hover:bg-tbm-magenta/5'
                    }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold transition-colors ${opt.multiplier === 0 ? 'text-slate-400' : 'text-slate-800 group-hover:text-tbm-magenta'}`}>
                          {opt.name}
                        </h4>
                        {opt.multiplier === 0 && (
                          <span className="text-[8px] font-black bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase">Non Disponibile</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {activeCategory !== 'curve' || opt.name === 'Pannelli 10 mm' ? (
                          <>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${opt.multiplier === 0 ? 'bg-slate-100 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                              {opt.code}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${opt.multiplier === 0 ? 'bg-slate-100 text-slate-400' : 'bg-tbm-magenta/10 text-tbm-magenta'}`}>
                              Multiplier: x{opt.multiplier}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-tbm-magenta/10 text-tbm-magenta">
                            Kit Configurazione Curva
                          </span>
                        )}
                      </div>
                    </div>
                    {activeCategory === 'curve' && opt.name === 'Pannelli 10 mm' && (
                      <div className="hidden md:flex flex-1 items-center gap-3 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl mx-4">
                        <Info size={14} className="text-tbm-sunset shrink-0" />
                        <p className="text-[10px] text-amber-800 leading-tight">
                          <span className="font-bold">Nota:</span> Le viti <span className="font-bold">BA700307</span> verranno sottratte dal totale delle <span className="font-bold">BA700197</span>.
                        </p>
                      </div>
                    )}

                    <div className="text-right shrink-0">
                      <p className={`text-[10px] font-bold uppercase mb-1 ${opt.multiplier === 0 ? 'text-slate-300' : 'text-slate-400'}`}>Pezzi</p>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        disabled={opt.multiplier === 0 || opt.name === "Modulo Centrale"}
                        className={`w-20 px-3 py-2 rounded-xl border-2 outline-none text-center font-black text-lg shadow-sm transition-all ${opt.multiplier === 0 || opt.name === "Modulo Centrale"
                          ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-70'
                          : 'border-slate-200 focus:border-tbm-magenta bg-white'
                          }`}
                        value={selections[opt.id] || ''}
                        onChange={e => handleInputChange(opt.id, e.target.value)}
                      />
                      {opt.name === "Modulo Centrale" && (
                        <p className="text-[8px] font-black text-tbm-magenta mt-1 uppercase text-center">Auto</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center opacity-30">
                  <Layers size={48} className="mx-auto mb-4" />
                  <p className="font-medium italic">Nessun dato trovato per i criteri selezionati.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <TableIcon size={20} className="text-tbm-magenta" />
                Dettaglio Analitico Elaborazione
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Riferimento Ricerca</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Numero Pezzi</th>
                    {MAIN_CODES.map(code => (
                      <th key={code} className="px-6 py-4 text-[10px] font-black text-tbm-magenta uppercase tracking-wider text-center">{code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {projectRows.length === 0 ? (
                    <tr>
                      <td colSpan={2 + MAIN_CODES.length} className="px-6 py-16 text-center text-slate-300 italic text-sm">
                        Compila le quantità per visualizzare lo scorporo dei codici.
                      </td>
                    </tr>
                  ) : (
                    projectRows.map((row, i) => (
                      <tr key={i} className="hover:bg-tbm-magenta/5 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-700">{row.riferimento}</td>
                        <td className="px-6 py-4 text-center"><span className="bg-slate-100 px-3 py-1 rounded-lg font-black text-slate-900">{row.pezzi}</span></td>
                        {MAIN_CODES.map(code => (
                          <td key={code} className="px-6 py-4 text-center">
                            {row.distribuzione[code] ? (
                              <span className="text-sm font-bold text-tbm-magenta">{row.distribuzione[code].toLocaleString()}</span>
                            ) : (
                              <span className="text-slate-200">-</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
                {projectRows.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-900 text-white">
                      <td colSpan={2} className="px-6 py-4 text-right font-black uppercase text-[10px] tracking-widest text-slate-400">Totali Codici Utilizzati</td>
                      {MAIN_CODES.map(code => (
                        <td key={code} className="px-6 py-4 text-center font-black text-lg text-tbm-sunset">
                          {totalsByCode[code]?.toLocaleString() || 0}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden border-emerald-100">
            <div className="p-6 border-b border-emerald-50 flex items-center justify-between bg-emerald-50/30">
              <h2 className="text-lg font-black text-emerald-900 flex items-center gap-2 uppercase tracking-tight">
                <FileSpreadsheet size={20} className="text-emerald-600" />
                Anteprima Distinta per Ordine
              </h2>
              <button
                onClick={exportExcel}
                className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 uppercase tracking-widest"
              >
                <Download size={16} />
                Scarica .xlsx
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100">
                    <th className="px-4 py-3 font-bold text-emerald-800 border-r border-emerald-100">Elemento</th>
                    <th className="px-4 py-3 font-bold text-emerald-800 border-r border-emerald-100">Struttura distinta componenti</th>
                    <th className="px-4 py-3 font-bold text-emerald-800 border-r border-emerald-100">QTÀ</th>
                    <th className="px-4 py-3 font-bold text-emerald-800 border-r border-emerald-100">Descrizione</th>
                    <th className="px-4 py-3 font-bold text-emerald-800 border-r border-emerald-100">Codice</th>
                    <th className="px-4 py-3 font-bold text-emerald-800 border-r border-emerald-100">Configurazione</th>
                    <th className="px-4 py-3 font-bold text-emerald-800 border-r border-emerald-100">Fornitore</th>
                    <th className="px-4 py-3 font-bold text-emerald-800">Ordinare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {distintaComponenti.map((row, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="px-4 py-3 text-center border-r border-slate-100">{row.Elemento}</td>
                      <td className="px-4 py-3 border-r border-slate-100">{row['Struttura distinta componenti']}</td>
                      <td className="px-4 py-3 font-black text-slate-900 text-center border-r border-slate-100 bg-emerald-50/10">{row.QTÀ}</td>
                      <td className="px-4 py-3 border-r border-slate-100 font-medium truncate max-w-[200px]">{row.Descrizione}</td>
                      <td className="px-4 py-3 border-r border-slate-100 font-bold">{row.Codice}</td>
                      <td className="px-4 py-3 border-r border-slate-100">{row.Configurazione}</td>
                      <td className="px-4 py-3 border-r border-slate-100">{row.Fornitore}</td>
                      <td className="px-4 py-3 text-center font-black text-tbm-magenta">{row.Ordinare}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-3xl shadow-2xl p-8 sticky top-24 text-white">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <Package className="text-tbm-sunset" />
              Totali Finali
            </h3>
            <div className="space-y-4 mb-8">
              {Object.entries(totalsByCode).length === 0 ? (
                <div className="text-center py-10 opacity-40">
                  <Info size={32} className="mx-auto mb-2" />
                  <p className="text-xs italic">Nessun fabbisogno generato</p>
                </div>
              ) : (
                Object.entries(totalsByCode).map(([code, total]) => (
                  <div key={code} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-blue-400 tracking-widest">{code}</span>
                      <span className="text-2xl font-black">{total.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium leading-tight line-clamp-2">
                      {products.find(p => p.id === code)?.description}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <button
                disabled={projectRows.length === 0 || isSaving}
                onClick={handleSave}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-500 disabled:opacity-30 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20"
              >
                <Save size={20} />
                Salva nel Cloud
              </button>
              <button
                disabled={projectRows.length === 0}
                onClick={exportExcel}
                className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-500 disabled:opacity-30 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20"
              >
                <Download size={20} />
                Scarica Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};
