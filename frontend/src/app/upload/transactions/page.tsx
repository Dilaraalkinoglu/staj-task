"use client";

import { useRef, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from "lucide-react";

interface UploadResult {
  message: string;
  addedCount: number;
  skippedCount: number;
  addedTransactions: { id: number; companyId: number; documentNo: string; debit: number; credit: number }[];
  skippedTransactions: { row: number; companyId?: number; documentNo?: string; reason: string }[];
}

export default function UploadTransactionsPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  function handleFile(f: File) {
    setFile(f);
    setResult(null);
    setError("");
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.postForm<UploadResult>("/transactions/upload-excel", form);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">İşlem Excel Yükleme</h1>
        <p className="page-subtitle">
          <strong>Upload_Transactions_Template</strong> formatında Excel yükleyin
        </p>
      </div>

      <div className="content-card" style={{ maxWidth: "640px" }}>
        <div className="content-card-header">
          <span className="content-card-title">Excel Dosyası Seç</span>
        </div>



        <div
          className={`upload-zone${dragOver ? " drag-over" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
        >
          <div className="upload-zone-icon">
            <FileSpreadsheet size={26} />
          </div>
          {file ? (
            <>
              <p><strong>{file.name}</strong></p>
              <p>{(file.size / 1024).toFixed(1)} KB</p>
            </>
          ) : (
            <>
              <p><strong>Dosyayı sürükleyin</strong> veya tıklayın</p>
              <p>.xlsx / .xls formatı desteklenir</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>

        <div className="form-actions">
          {file && (
            <button
              className="btn btn-secondary"
              onClick={() => { setFile(null); setResult(null); setError(""); }}
            >
              Temizle
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            <Upload size={16} />
            {loading ? "Yükleniyor…" : "Yükle ve Kaydet"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="content-card" style={{ maxWidth: "640px" }}>
          <div className="content-card-header">
            <span className="content-card-title">Yükleme Sonucu</span>
          </div>

          <div className="stat-grid" style={{ marginBottom: "1.25rem" }}>
            <div className="stat-card green">
              <div className="stat-card-label">Eklendi</div>
              <div className="stat-card-value">{result.addedCount}</div>
            </div>
            <div className="stat-card red">
              <div className="stat-card-label">Atlandı</div>
              <div className="stat-card-value">{result.skippedCount}</div>
            </div>
          </div>

          {result.addedTransactions.length > 0 && (
            <>
              <div style={{ fontWeight: 600, marginBottom: "0.5rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <CheckCircle size={15} style={{ color: "oklch(0.45 0.18 145)" }} />
                Eklenen İşlemler
              </div>
              <div className="table-wrapper" style={{ marginBottom: "1rem" }}>
                <table className="data-table">
                  <thead>
                    <tr><th>ID</th><th>Firma ID</th><th>Belge No</th><th>Borç</th><th>Alacak</th></tr>
                  </thead>
                  <tbody>
                    {result.addedTransactions.map((t) => (
                      <tr key={t.id}>
                        <td>{t.id}</td>
                        <td>{t.companyId}</td>
                        <td style={{ fontFamily: "monospace" }}>{t.documentNo}</td>
                        <td className="amount-debit">{t.debit > 0 ? t.debit.toFixed(2) : "—"}</td>
                        <td className="amount-credit">{t.credit > 0 ? t.credit.toFixed(2) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {result.skippedTransactions.length > 0 && (
            <>
              <div style={{ fontWeight: 600, marginBottom: "0.5rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <XCircle size={15} style={{ color: "oklch(0.52 0.22 27)" }} />
                Atlanan İşlemler
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>Satır</th><th>Belge No</th><th>Neden</th></tr>
                  </thead>
                  <tbody>
                    {result.skippedTransactions.map((t, i) => (
                      <tr key={i}>
                        <td>{t.row}</td>
                        <td style={{ fontFamily: "monospace" }}>{t.documentNo ?? "—"}</td>
                        <td style={{ color: "oklch(0.52 0.22 27)", fontSize: "0.82rem" }}>{t.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </AppLayout>
  );
}
