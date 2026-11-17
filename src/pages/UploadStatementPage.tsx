import React, { useRef, useState } from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  UploadCloud,
  X,
} from 'lucide-react';
import { SAMPLE_BANK_CSV } from '../data/seedData';
import { ALL_CATEGORIES, Category, PageRoute, ParsedCsvRow } from '../types/finance';
import { parseBankStatementCsv } from '../utils/categorizer';
import { formatDateShort, formatINR } from '../utils/format';

interface UploadStatementPageProps {
  onImportRows: (rows: ParsedCsvRow[]) => number;
  onNavigate: (route: PageRoute) => void;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export const UploadStatementPage: React.FC<UploadStatementPageProps> = ({
  onImportRows,
  onNavigate,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSizeText, setFileSizeText] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<ParsedCsvRow[]>([]);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const processCsvContent = (text: string, name: string, sizeBytes: number) => {
    setError(null);
    setImportedCount(null);
    setFileName(name);
    setFileSizeText(
      sizeBytes < 1024
        ? `${sizeBytes} B`
        : `${(sizeBytes / 1024).toFixed(1)} KB`
    );
    setIsProcessing(true);
    setProgress(25);

    const parsed = parseBankStatementCsv(text);

    window.setTimeout(() => setProgress(70), 120);
    window.setTimeout(() => {
      setProgress(100);
      setIsProcessing(false);
      if (parsed.error) {
        setError(parsed.error);
        setPreviewRows([]);
      } else {
        setPreviewRows(parsed.rows);
      }
    }, 260);
  };

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      setError('Only CSV (.csv) bank statement files are supported.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('File exceeds the 5 MB maximum upload size.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      processCsvContent(content, file.name, file.size);
    };
    reader.onerror = () => {
      setError('Could not read the selected CSV file.');
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleLoadSampleCsv = () => {
    processCsvContent(
      SAMPLE_BANK_CSV,
      'hdfc_statement_nov_2026.csv',
      new Blob([SAMPLE_BANK_CSV]).size
    );
  };

  const handleCategoryOverride = (rowId: string, category: Category) => {
    setPreviewRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, category } : row))
    );
  };

  const handleCancelUpload = () => {
    setFileName(null);
    setFileSizeText(null);
    setProgress(0);
    setIsProcessing(false);
    setError(null);
    setPreviewRows([]);
    setImportedCount(null);
  };

  const handleImport = () => {
    if (previewRows.length === 0) return;
    const count = onImportRows(previewRows);
    setImportedCount(count);
    setPreviewRows([]);
    setFileName(null);
    setFileSizeText(null);
    setProgress(0);
  };

  const handleDownloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_BANK_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_bank_statement.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalDebit = previewRows.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = previewRows.reduce((sum, r) => sum + r.credit, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
            Upload Bank Statement
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Extract transactions from CSV statements and review automated categorization before importing.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadSampleCsv}
          className="px-4 py-2 rounded-lg border border-neutral-300 bg-white text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors whitespace-nowrap shrink-0"
        >
          Download sample CSV
        </button>
      </div>

      {/* Import Success Confirmation */}
      {importedCount !== null && (
        <div
          role="status"
          className="rounded-xl border border-neutral-300 bg-neutral-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-neutral-950 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-neutral-950">
                {importedCount} transactions imported into SmartSpend
              </p>
              <p className="text-xs text-neutral-600 mt-0.5">
                Dashboard totals, spending analytics, and category budgets have been updated.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('transactions')}
              className="px-3.5 py-2 rounded-lg border border-neutral-300 bg-white text-xs font-medium text-neutral-900 hover:bg-neutral-100 whitespace-nowrap"
            >
              View transactions
            </button>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-3.5 py-2 rounded-lg bg-neutral-950 text-white text-xs font-medium hover:bg-neutral-800 whitespace-nowrap"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      )}

      {/* Drag and Drop Area */}
      <section aria-label="CSV upload dropzone">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-colors ${
            isDragging
              ? 'border-neutral-950 bg-neutral-100'
              : 'border-neutral-300 bg-neutral-50/70 hover:border-neutral-400'
          }`}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-900 mb-4">
            <UploadCloud className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-neutral-950">
            Drag and drop your CSV bank statement here
          </h2>
          <p className="mt-1.5 text-sm text-neutral-600 max-w-md mx-auto">
            SmartSpend parses Date, Description, Debit, and Credit columns locally and assigns categories automatically.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Choose CSV file"
          />

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-lg bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              Browse files
            </button>
            <button
              type="button"
              onClick={handleLoadSampleCsv}
              className="px-5 py-2.5 rounded-lg border border-neutral-300 bg-white text-sm font-medium text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              Use sample statement
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-neutral-500">
            <span>Accepted format: CSV (.csv)</span>
            <span aria-hidden="true">·</span>
            <span>Maximum file size: 5 MB</span>
            <span aria-hidden="true">·</span>
            <span>Required columns: Date, Description, Debit, Credit</span>
          </div>
        </div>
      </section>

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-neutral-300 bg-neutral-100 px-4 py-3 text-sm text-neutral-950 flex items-center justify-between gap-4"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={handleCancelUpload}
            aria-label="Dismiss upload error"
            className="p-1 rounded hover:bg-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* File Status & Progress Indicator */}
      {fileName && (
        <section
          aria-label="Upload progress"
          className="rounded-xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-900 shrink-0">
                <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-950 truncate">{fileName}</p>
                <p className="text-xs text-neutral-500">
                  {fileSizeText} · {isProcessing ? 'Extracting and categorizing...' : `${previewRows.length} transactions ready for review`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancelUpload}
              className="px-3.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-medium text-neutral-800 hover:bg-neutral-50 self-start sm:self-center whitespace-nowrap"
            >
              Cancel upload
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-neutral-600 mb-1.5">
              <span>{isProcessing ? 'Parsing statement...' : 'Extraction complete'}</span>
              <span className="font-mono-num">{progress}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden"
            >
              <div
                className="h-full bg-neutral-950 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Extracted Transactions Preview Table */}
      {previewRows.length > 0 && (
        <section
          aria-label="Extracted transactions preview"
          className="rounded-xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden"
        >
          <div className="px-5 sm:px-6 py-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-neutral-950">
                Preview Extracted Transactions ({previewRows.length})
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5 font-mono-num">
                Total Debit: {formatINR(totalDebit)} · Total Credit: {formatINR(totalCredit)}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCancelUpload}
                className="px-4 py-2 rounded-lg border border-neutral-300 bg-white text-sm font-medium text-neutral-900 hover:bg-neutral-50 whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                className="px-4 py-2 rounded-lg bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 whitespace-nowrap cursor-pointer"
              >
                Import Transactions
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-500">
                  <th className="py-3 px-5 sm:px-6">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Debit</th>
                  <th className="py-3 px-4 text-right">Credit</th>
                  <th className="py-3 px-5 sm:px-6">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {previewRows.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-50/80">
                    <td className="py-3 px-5 sm:px-6 text-xs text-neutral-600 whitespace-nowrap font-mono-num">
                      {formatDateShort(row.date)}
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-950">
                      {row.description}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-num whitespace-nowrap text-neutral-950">
                      {row.debit > 0 ? formatINR(row.debit) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-num whitespace-nowrap text-neutral-950">
                      {row.credit > 0 ? formatINR(row.credit) : '—'}
                    </td>
                    <td className="py-3 px-5 sm:px-6 whitespace-nowrap">
                      <select
                        aria-label={`Category for ${row.description}`}
                        value={row.category}
                        onChange={(e) =>
                          handleCategoryOverride(row.id, e.target.value as Category)
                        }
                        className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-900 focus:outline-none focus:border-neutral-950"
                      >
                        {ALL_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
