"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";
import Link from "next/link";

interface Company {
  id: number;
  name: string;
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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<Transaction[]>("/transactions"),
      api.get<Company[]>("/companies"),
    ])
      .then(([txns, comps]) => {
        setTransactions(txns);
        setCompanies(comps);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    selectedCompany === "all"
      ? transactions
      : transactions.filter((t) => String(t.companyId) === selectedCompany);

  const totalDebit = filtered.reduce((s, t) => s + t.debit, 0);
  const totalCredit = filtered.reduce((s, t) => s + t.credit, 0);

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Finansal Kayıtlar</h1>
        <p className="page-subtitle">
          Tüm finansal işlem hareketleri — {transactions.length} kayıt
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Summary */}
      <div className="stat-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card red">
          <div className="stat-card-label">Toplam Borç</div>
          <div className="stat-card-value">{fmt(totalDebit)}</div>
          <div className="stat-card-sub">Filtreli toplam</div>
        </div>
        <div className="stat-card green">
          <div className="stat-card-label">Toplam Alacak</div>
          <div className="stat-card-value">{fmt(totalCredit)}</div>
          <div className="stat-card-sub">Filtreli toplam</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Net</div>
          <div
            className="stat-card-value"
            style={{
              color:
                totalCredit - totalDebit >= 0
                  ? "oklch(0.45 0.18 145)"
                  : "oklch(0.52 0.22 27)",
            }}
          >
            {fmt(totalCredit - totalDebit)}
          </div>
          <div className="stat-card-sub">{filtered.length} kayıt</div>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span className="content-card-title">İşlemler</span>
            <select
              className="form-select"
              style={{ width: "220px" }}
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="all">Tüm Firmalar</option>
              {companies.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Link href="/add/transaction" className="btn btn-primary btn-sm">
            <Plus size={15} />
            İşlem Ekle
          </Link>
        </div>

        {loading ? (
          <div className="empty-state">
            <span className="loading-spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>Kayıt bulunamadı.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Firma</th>
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
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                      {new Date(t.date).toLocaleDateString("tr-TR")}
                    </td>
                    <td style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                      {t.companyName}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                      {t.documentNo}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                      {t.accountCode}
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>{t.accountName}</td>
                    <td style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.description}
                    </td>
                    <td className="amount-debit">
                      {t.debit > 0 ? fmt(t.debit) : "—"}
                    </td>
                    <td className="amount-credit">
                      {t.credit > 0 ? fmt(t.credit) : "—"}
                    </td>
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
