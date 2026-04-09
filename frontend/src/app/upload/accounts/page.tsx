"use client";

import { useRef, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { Upload, FileSpreadsheet, CheckCircle } from "lucide-react";

interface UploadResult {
  message: string;
  addedCount: number;
}

export default function UploadAccountsPage() {
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
      const res = await api.postForm<UploadResult>("/accounts/upload-excel", form);
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
        <h1 className="page-title">Hesap Planı Yükleme</h1>
        <p className="page-subtitle">
          İçerisinde <strong>Accounts</strong> sayfası bulunan Excel dosyasını yükleyin
        </p>
      </div>

      <div className="content-card" style={{ maxWidth: "640px" }}>
        <div className="content-card-header">
          <span className="content-card-title">Excel Dosyası Seç</span>
        </div>



        {/* Drop Zone */}
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
            <div className="stat-card green" style={{ gridColumn: "1 / -1" }}>
              <div className="stat-card-label">Güncellenen/Eklenen Hesaplar</div>
              <div className="stat-card-value text-center" style={{ textAlign: "center", width: "100%" }}>{result.addedCount}</div>
            </div>
          </div>
          
          <div className="alert alert-success" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <CheckCircle size={18} />
              Hesap planı başarıyla kaydedildi. Artık "Manuel İşlem Ekle" ekranında bu hesapları liste olarak görebileceksiniz.
          </div>
        </div>
      )}
    </AppLayout>
  );
}
