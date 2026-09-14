import { useState } from 'react';
import { apiWritings, apiExport } from '../../api/client';
import { Stagger, Item } from '../../components/ui/motion.jsx';

export default function ImportExportPage() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleExportJSON = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/export/json');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'poetry-archive-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setExporting(false);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/export/csv');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'poetry-archive-writings.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setExporting(false);
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    try {
      const data = JSON.parse(importText);
      const writings = Array.isArray(data) ? data : data.writings || [];
      const result = await apiWritings.admin.import({ writings });
      setImportResult(result);
      setImportText('');
    } catch (err) {
      setImportResult({ error: err.message || 'Invalid JSON' });
    }
    setImporting(false);
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImportText(ev.target.result);
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImportText(ev.target.result);
    reader.readAsText(file);
  };

  return (
    <Stagger className="max-w-4xl">
      <Item as="h1" y={0} className="font-body text-2xl text-ink-100 mb-8">Import / Export</Item>

      {/* Export */}
      <Item className="mb-12">
        <h2 className="font-body text-xs uppercase tracking-wider text-ink-400 mb-4">Export</h2>
        <div className="flex gap-4">
          <button onClick={handleExportJSON} disabled={exporting} className="btn-primary text-xs">
            {exporting ? 'Exporting...' : 'Export as JSON'}
          </button>
          <button onClick={handleExportCSV} disabled={exporting} className="btn-secondary text-xs">
            {exporting ? 'Exporting...' : 'Export as CSV'}
          </button>
        </div>
        <p className="font-body text-xs text-ink-500 mt-2">
          Download all your content as JSON (complete backup) or CSV (writings only).
        </p>
      </Item>

      {/* Import */}
      <Item y={0}>
        <h2 className="font-body text-xs uppercase tracking-wider text-ink-400 mb-4">Import</h2>

        <div
          className={`p-8 border-2 border-dashed rounded-sm text-center transition-colors ${
            dragOver ? 'border-gold-500 bg-gold-500/5' : 'border-ink-700'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <p className="font-body text-sm text-ink-400 mb-4">
            Drop a JSON file here or
          </p>
          <label className="btn-secondary text-xs cursor-pointer inline-block">
            Choose File
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>
        </div>

        <div className="mt-4">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="textarea-field min-h-[200px] font-mono text-xs"
            placeholder='Paste JSON data here. Format: { "writings": [{ "text": "...", "author_name": "...", "type": "quote" }] }'
          />
        </div>

        <button onClick={handleImport} disabled={importing || !importText.trim()} className="btn-primary text-xs mt-4">
          {importing ? 'Importing...' : 'Import Writings'}
        </button>

        {importResult && (
          <div className={`mt-4 p-3 rounded-sm ${importResult.error ? 'bg-red-900/20 border border-red-800/30' : 'bg-emerald-900/20 border border-emerald-800/30'}`}>
            <p className={`font-body text-sm ${importResult.error ? 'text-red-400' : 'text-emerald-400'}`}>
              {importResult.error || importResult.message}
            </p>
          </div>
        )}

        <div className="mt-6 p-4 bg-ink-900/30 border border-ink-800/30 rounded-sm">
          <h3 className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2">Import Format</h3>
          <pre className="font-mono text-xs text-ink-300 overflow-x-auto">{`{
  "writings": [
    {
      "text": "The wound is the place where the Light enters you.",
      "author_name": "Rumi",
      "type": "quote",
      "language": "english",
      "source": "The Essential Rumi"
    },
    {
      "text": "Hē ālēkē āpanā jībana diẏē kēmone lēkhā yāy...",
      "author_name": "Kazi Nazrul Islam",
      "type": "poetry",
      "language": "bangla"
    }
  ]
}`}</pre>
        </div>
      </Item>
    </Stagger>
  );
}
