# TBM Gestione Viteria

Applicazione web per la gestione e il calcolo del fabbisogno di viteria e componenti per progetti TBM (Tunnel Boring Machine).

## 🚀 Avvio in locale

**Prerequisiti:** Node.js 18+

1. Installa le dipendenze:
   ```bash
   npm install
   ```
2. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```
3. Apri il browser su: `http://localhost:3000`

**Credenziali di test:** `admin@tbm.it` / `admin@tbm.it`

---

## 📦 Build di produzione

```bash
npm run build
```
I file vengono generati nella cartella `dist/`.

---

## 📤 Deploy su GitHub Pages

### Metodo 1 — Automatico con GitHub Actions (Consigliato)

Ad ogni push sul branch `main`, il workflow `.github/workflows/deploy.yml` esegue automaticamente il build e il deploy su GitHub Pages.

**Setup iniziale:**
1. Vai su **GitHub → Settings → Pages**
2. In "Source" seleziona **GitHub Actions**
3. Fai un push su `main` — il deploy parte automaticamente!

### Metodo 2 — Manuale con gh-pages

```bash
npm run deploy
```

---

## 🏗️ Struttura del Progetto

```
tbm-gestione-viteria/
├── .github/workflows/deploy.yml  # CI/CD GitHub Actions
├── Database/                     # File JSON dei database
│   ├── AltezzeDB.json
│   ├── ModuliDB.json
│   ├── CurveDB.json
│   └── VarieDB.json
├── components/
│   └── Navbar.tsx
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Configurator.tsx   # Motore principale di calcolo
│   ├── History.tsx
│   └── AdminPanel.tsx
├── App.tsx                # Router + Auth Context
├── types.ts               # Tipi TypeScript
└── vite.config.ts
```

## ⚙️ Configurazione `vite.config.ts`

Il parametro `base` deve corrispondere al nome del repository GitHub:
```typescript
base: '/nome-del-tuo-repo/',
```
