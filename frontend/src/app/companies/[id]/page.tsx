"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

interface Company {
  id: number;
  name: string;
  taxNumber: string;
  city: string;
  sector: string;
  isActive: boolean;
  createdAt: string;
}

interface Transaction {
  id: number;
  companyId: number;
  companyName: string;
  date: string;
  documentNo: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
  netEffect: number;
  transactionType: string;
  entryMethod: string;
  currency: string;
  status: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(n);
}

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [company, setCompany] = useState<Company | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingC, setLoadingC] = useState(true);
  const [loadingT, setLoadingT] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Company>(`/companies/${id}`)
      .then(setCompany)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingC(false));

    api
      .get<Transaction[]>(`/transactions/company/${id}`)
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setLoadingT(false));
  }, [id]);

  const totalDebit = transactions.reduce((s, t) => s + t.debit, 0);
  const totalCredit = transactions.reduce((s, t) => s + t.credit, 0);
  const net = totalCredit - totalDebit;

  return (
    <AppLayout>
      <div className="page-header" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>
          <ArrowLeft size={16} />
          Geri
        </button>
        <div>
          <h1 className="page-title">{company?.name ?? "Firma Detayı"}</h1>
          <p className="page-subtitle">Firma bilgileri ve finansal kayıtlar</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!loadingC && company && (
        <div className="content-card" style={{ marginBottom: "1.5rem" }}>
          <div className="content-card-header">
            <span className="content-card-title">Firma Bilgileri</span>
            <span className={`badge ${company.isActive ? "badge-green" : "badge-gray"}`}>
              {company.isActive ? "Aktif" : "Pasif"}
            </span>
          </div>
          <div className="form-grid">
            <div>
              <div className="form-label">Firma Adı</div>
              <div style={{ fontWeight: 600 }}>{company.name}</div>
            </div>
            <div>
              <div className="form-label">Vergi No</div>
              <div style={{ fontFamily: "monospace" }}>{company.taxNumber}</div>
            </div>
            <div>
              <div className="form-label">Şehir</div>
              <div>{company.city}</div>
            </div>
            <div>
              <div className="form-label">Sektör</div>
              <div>{company.sector}</div>
            </div>
            <div>
              <div className="form-label">Kayıt Tarihi</div>
              <div>{new Date(company.createdAt).toLocaleDateString("tr-TR")}</div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {!loadingT && (
        <div className="stat-grid" style={{ marginBottom: "1.5rem" }}>
          <div className="stat-card red">
            <div className="stat-card-label">Toplam Borç</div>
            <div className="stat-card-value">{fmt(totalDebit)}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-card-label">Toplam Alacak</div>
            <div className="stat-card-value">{fmt(totalCredit)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Net Bakiye</div>
            <div
              className="stat-card-value"
              style={{ color: net >= 0 ? "oklch(0.45 0.18 145)" : "oklch(0.52 0.22 27)" }}
            >
              {fmt(net)}
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="content-card">
        <div className="content-card-header">
          <span className="content-card-title">
            Finansal Kayıtlar ({transactions.length})
          </span>
        </div>

        {loadingT ? (
          <div className="empty-state"><span className="loading-spinner" /></div>
        ) : transactions.length === 0 ? (
          <div className="empty-state"><p>Bu firmaya ait kayıt bulunamadı.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Belge No</th>
                  <th>Hesap Kodu</th>
                  <th>Hesap Adı</th>
                  <th>Açıklama</th>
                  <th>Borç</th>
                  <th>Alacak</th>
                  <th>Net Etki</th>
                  <th>Tür</th>
                  <th>Giriş</th>
                  <th>Döviz</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                      {new Date(t.date).toLocaleDateString("tr-TR")}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>{t.documentNo}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>{t.accountCode}</td>
                    <td>{t.accountName}</td>
                    <td style={{ color: "var(--muted-foreground)", fontSize: "0.82rem" }}>{t.description}</td>
                    <td className="amount-debit">{t.debit > 0 ? fmt(t.debit) : "—"}</td>
                    <td className="amount-credit">{t.credit > 0 ? fmt(t.credit) : "—"}</td>
                    <td
                      style={{
                        fontWeight: 600,
                        color:
                          t.netEffect > 0
                            ? "oklch(0.45 0.18 145)"
                            : t.netEffect < 0
                            ? "oklch(0.52 0.22 27)"
                            : "var(--muted-foreground)",
                      }}
                    >
                      {fmt(t.netEffect)}
                    </td>
                    <td>
                      {t.transactionType ? (
                        <span className="badge badge-blue">{t.transactionType}</span>
                      ) : "—"}
                    </td>
                    <td>
                      <span className={`badge ${t.entryMethod === "ExcelUpload" ? "badge-blue" : "badge-gray"}`}>
                        {t.entryMethod === "ExcelUpload" ? "Excel" : "Manuel"}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                      {t.currency || "—"}
                    </td>
                    <td>
                      {t.status ? (
                        <span className={`badge ${t.status === "Onaylı" || t.status === "Aktif" ? "badge-green" : t.status === "Beklemede" ? "badge-blue" : "badge-gray"}`}>
                          {t.status}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
