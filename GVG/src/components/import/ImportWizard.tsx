'use client';

import React, { useState } from 'react';
import { Beneficiary, ColumnMapping, DeduplicationItem, ImportBatch, RawImportRow } from '../../types/gvg';
import { autoDetectColumnMappings, parseDelimitedText, processAndDeduplicateImport } from '../../lib/import/parser';
import { FileUp, Clipboard, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, Table, Save, Layers } from 'lucide-react';

interface ImportWizardProps {
  existingBeneficiaries: Beneficiary[];
  onCommitImport: (newBeneficiaries: Beneficiary[], batchRecord: ImportBatch) => void;
  importHistory: ImportBatch[];
}

export const ImportWizard: React.FC<ImportWizardProps> = ({
  existingBeneficiaries,
  onCommitImport,
  importHistory,
}) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'complete'>('upload');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileFormat, setFileFormat] = useState<ImportBatch['format']>('csv');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<RawImportRow[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [dedupeItems, setDedupeItems] = useState<DeduplicationItem[]>([]);
  const [batchSummary, setBatchSummary] = useState<ImportBatch | null>(null);

  const handleLoadSampleDataset = (type: 'messy' | 'clean' | 'incomplete') => {
    let sample = '';
    let name = '';
    let format: ImportBatch['format'] = 'csv';

    if (type === 'messy') {
      name = 'Kano_Messy_Disbursement_Sheet.csv';
      format = 'csv';
      sample = `Beneficiary Name,Phone No,Local Govt,State of Origin,Asset Type,Special Needs,Grant Sum
Audu Ibrahim,08031112233,Kano Municipal,Kano,Sewing Machine,Visual Impairment,40000
Halima Sani,2348123334455,Kano Municipal,Kano,Grinding Machine,,40000
Usman Garba,08123334455,Kano Municipal,Kano,Grinding Machine,Visual Impairment,40000
Binta Mohammed,07058889900,Tarauni,Kano,Sewing Machine,Mobility Impairment,40000
Kabiru Yahaya,08092223344,Fagge,Kano,Grinding Machine,Senior Citizen,40000`;
    } else if (type === 'incomplete') {
      name = 'Quick_LGA_Field_Contact_List.txt';
      format = 'pasted';
      sample = `Full Name\tContact Number\tLGA
Nneka Egwu\t08061112233\tEnugu East
Sunday Nwosu\t08149998877\t
Chinwe Okafor\t08035554433\tEnugu North
Emeka Nnamdi\t08186665544\tEnugu North`;
    } else {
      name = 'Phase2_National_Social_Register_Bulk.csv';
      format = 'csv';
      sample = `Name,Phone,LGA,State,Category,Disability,Date Disbursed,Serial
Yusuf Umar,08027776655,Kaduna South,Kaduna,Sewing Machine,Hearing Impairment,2026-03-01,SEW-KD-001
Zainab Shehu,08038887766,Kaduna South,Kaduna,Grinding Machine,None,2026-03-01,GRD-KD-002
Chiamaka Eze,08139998877,Port Harcourt,Rivers,Sewing Machine,Senior Citizen,2026-03-02,SEW-RV-003`;
    }

    setRawText(sample);
    setFileName(name);
    setFileFormat(format);
    processInputText(sample);
  };

  const processInputText = (textToParse: string) => {
    const { headers: parsedHeaders, rows: parsedRows } = parseDelimitedText(textToParse);
    if (parsedHeaders.length === 0 || parsedRows.length === 0) {
      alert('Could not parse tabular data. Please ensure headers and rows are present.');
      return;
    }
    setHeaders(parsedHeaders);
    setRawRows(parsedRows);
    const autoMappings = autoDetectColumnMappings(parsedHeaders);
    setMappings(autoMappings);
    setStep('mapping');
  };

  const handleMappingChange = (fileHeader: string, newTarget: any) => {
    setMappings((prev) =>
      prev.map((m) => (m.fileHeader === fileHeader ? { ...m, targetField: newTarget } : m))
    );
  };

  const handleProceedToPreview = () => {
    const batchId = `batch-${Date.now()}`;
    const items = processAndDeduplicateImport(rawRows, mappings, existingBeneficiaries, batchId);
    setDedupeItems(items);
    setStep('preview');
  };

  const handleActionToggle = (index: number, action: DeduplicationItem['selectedAction']) => {
    setDedupeItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selectedAction: action } : item))
    );
  };

  const handleCommit = () => {
    const batchId = `batch-${Date.now()}`;
    const itemsToImport = dedupeItems.filter((item) => item.selectedAction !== 'skip');

    const newBeneficiaryRecords: Beneficiary[] = itemsToImport.map((item, idx) => {
      const p = item.mappedBeneficiary;
      return {
        id: `ben-${Date.now()}-${idx}`,
        full_name: p.full_name || 'Unnamed Beneficiary',
        phone_number: p.phone_number || '',
        lga: p.lga || 'Unassigned LGA',
        state: p.state || 'Unassigned State',
        category: p.category || 'unassigned',
        disability_status: p.disability_status || null,
        disbursement_date: p.disbursement_date || new Date().toISOString().split('T')[0],
        amount_received: p.amount_received || 40000,
        machine_serial: p.machine_serial || null,
        baseline_photo_url: null,
        assigned_agent_id: null,
        profile_status: p.profile_status || 'incomplete',
        status: p.status || 'active',
        created_at: new Date().toISOString(),
        source: batchId,
        missed_checkins_count: 0,
        last_checkin_date: null,
      };
    });

    const flaggedCount = dedupeItems.filter((i) => i.issue !== 'valid').length;

    const batchRecord: ImportBatch = {
      id: batchId,
      uploaded_by: 'Admin User',
      filename: fileName || 'Pasted_Table_Import.csv',
      format: fileFormat,
      rows_total: rawRows.length,
      rows_added: newBeneficiaryRecords.length,
      rows_flagged: flaggedCount,
      created_at: new Date().toISOString(),
    };

    setBatchSummary(batchRecord);
    onCommitImport(newBeneficiaryRecords, batchRecord);
    setStep('complete');
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Flexible Multi-Format Import Pipeline
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports <code className="text-emerald-700 dark:text-emerald-300 bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded">.xlsx</code>,{' '}
              <code className="text-emerald-700 dark:text-emerald-300 bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded">.csv</code>,{' '}
              <code className="text-emerald-700 dark:text-emerald-300 bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded">.docx tables</code>, or pasted data. Partial records accepted.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className={step === 'upload' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-60'}>1. Source</span> &rarr;
            <span className={step === 'mapping' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-60'}>2. Map Columns</span> &rarr;
            <span className={step === 'preview' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-60'}>3. Preview & Dedupe</span> &rarr;
            <span className={step === 'complete' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-60'}>4. Commit</span>
          </div>
        </div>
      </div>

      {/* STEP 1: UPLOAD / PASTE */}
      {step === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paste Tabular Text or Drag & Drop File</h3>

            <textarea
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setFileName('Pasted_Raw_Table.csv');
                setFileFormat('pasted');
              }}
              rows={8}
              placeholder="Paste table columns here (Name, Phone, LGA, State, Machine Type)..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            />

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <button
                onClick={() => processInputText(rawText)}
                disabled={!rawText.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition"
              >
                Parse & Match Headers <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-300">Auto Headers:</span> Name / Phone / LGA / State / Category / Disability
              </div>
            </div>
          </div>

          {/* Quick Demo Pre-load Datasets */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              Try Demo Test Datasets
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => handleLoadSampleDataset('messy')}
                className="w-full text-left bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition group"
              >
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  📄 Messy Kano Field Sheet (CSV)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Contains duplicate phone, non-standard headers & missing tags.
                </div>
              </button>

              <button
                onClick={() => handleLoadSampleDataset('incomplete')}
                className="w-full text-left bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition group"
              >
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  📋 Partial Contact List (DOCX/Pasted)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Only Name + Phone + Partial LGA (`profile_status: incomplete`).
                </div>
              </button>

              <button
                onClick={() => handleLoadSampleDataset('clean')}
                className="w-full text-left bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition group"
              >
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  📊 National Social Register Bulk (XLSX)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Full dataset with machine serials & disbursement dates.
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: MAPPING */}
      {step === 'mapping' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Fuzzy Header Auto-Detection & Mapping Confirmation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Detected <strong>{headers.length}</strong> columns in <span className="text-emerald-600 dark:text-emerald-400 font-bold">{fileName}</span>.
              </p>
            </div>
            <button onClick={() => setStep('upload')} className="text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white underline">
              Back to Source
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mappings.map((map) => (
              <div key={map.fileHeader} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl space-y-2">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">File Header:</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{map.fileHeader}</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">&darr; Target Field:</div>
                <select
                  value={map.targetField}
                  onChange={(e) => handleMappingChange(map.fileHeader, e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-lg p-2 focus:outline-none font-semibold"
                >
                  <option value="full_name">full_name (Name)</option>
                  <option value="phone_number">phone_number (Phone)</option>
                  <option value="lga">lga (LGA)</option>
                  <option value="state">state (State)</option>
                  <option value="category">category (Sewing | Grinding)</option>
                  <option value="disability_status">disability_status (Disability)</option>
                  <option value="disbursement_date">disbursement_date (Date)</option>
                  <option value="amount_received">amount_received (Amount)</option>
                  <option value="machine_serial">machine_serial (Serial)</option>
                  <option value="ignore">-- Ignore Column --</option>
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleProceedToPreview}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition"
            >
              Generate Deduplication Preview ({rawRows.length} Rows) &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PREVIEW */}
      {step === 'preview' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Deduplication & Partial Record Review Preview</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Showing preview of <strong>{dedupeItems.length}</strong> records. Phone numbers normalized to <code className="text-emerald-700 dark:text-emerald-300">+234...</code> format.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-lg font-bold">
                Valid to Import: {dedupeItems.filter((i) => i.selectedAction === 'import').length}
              </span>
              <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2.5 py-1 rounded-lg font-bold">
                Duplicates Flagged: {dedupeItems.filter((i) => i.issue !== 'valid').length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl max-h-96">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-bold sticky top-0">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">LGA & State</th>
                  <th className="p-3">Profile Status</th>
                  <th className="p-3">Detected Issue</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                {dedupeItems.map((item, idx) => {
                  const b = item.mappedBeneficiary;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{b.full_name}</td>
                      <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400">{b.phone_number || 'Missing Phone'}</td>
                      <td className="p-3">{b.lga}, {b.state}</td>
                      <td className="p-3">
                        {b.profile_status === 'incomplete' ? (
                          <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded text-[11px] font-semibold inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Incomplete Profile
                          </span>
                        ) : (
                          <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                            Complete
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {item.issue === 'phone_match' && (
                          <span className="text-red-500 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Phone Match ({item.matchedExisting?.full_name})
                          </span>
                        )}
                        {item.issue === 'exact_duplicate' && <span className="text-amber-500 font-bold">Duplicate Phone</span>}
                        {item.issue === 'incomplete_fields' && <span className="text-slate-400">Valid Partial Record</span>}
                        {item.issue === 'valid' && <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Clean Record</span>}
                      </td>
                      <td className="p-3 text-right">
                        <select
                          value={item.selectedAction}
                          onChange={(e) => handleActionToggle(idx, e.target.value as any)}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none font-bold"
                        >
                          <option value="import">Import Record</option>
                          <option value="skip">Skip Row</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button onClick={() => setStep('mapping')} className="text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white underline">
              Back to Mappings
            </button>

            <button
              onClick={handleCommit}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Commit Batch to Registry Database &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: COMPLETE */}
      {step === 'complete' && batchSummary && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 border border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Batch Import Successfully Committed!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Batch ID: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{batchSummary.id}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{batchSummary.rows_total}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">Total File Rows</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{batchSummary.rows_added}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">Records Inserted</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
              <div className="text-2xl font-black text-amber-500">{batchSummary.rows_flagged}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">Flagged / Resolved</div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                setRawText('');
                setStep('upload');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
            >
              Import Another Dataset
            </button>
          </div>
        </div>
      )}

      {/* IMPORT HISTORY AUDIT TRAIL LOG TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> System Import Audit Trail Log (import_batches)
        </h3>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-bold">
              <tr>
                <th className="p-3">Batch ID</th>
                <th className="p-3">Uploaded By</th>
                <th className="p-3">File Name</th>
                <th className="p-3">Format</th>
                <th className="p-3">Total Rows</th>
                <th className="p-3">Added</th>
                <th className="p-3">Flagged</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
              {importHistory.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                  <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{batch.id}</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{batch.uploaded_by}</td>
                  <td className="p-3">{batch.filename}</td>
                  <td className="p-3 uppercase font-mono text-[11px] text-slate-400">{batch.format}</td>
                  <td className="p-3">{batch.rows_total}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{batch.rows_added}</td>
                  <td className="p-3 text-amber-500 font-bold">{batch.rows_flagged}</td>
                  <td className="p-3 text-slate-400">{new Date(batch.created_at).toLocaleString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
