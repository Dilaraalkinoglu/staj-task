"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { Save, ArrowLeft } from "lucide-react";

interface Company {
  id: number;
  name: string;
}

interface Account {
  accountCode: string;
  accountName: string;
  accountGroup: string;
}

interface TransactionForm {
  companyId: string;
  date: string;
  documentNo: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: string;
  credit: string;
  transactionType: string;
  currency: string;
  status: string;
}

const TRANSACTION_TYPES = ["Satış", "Alış", "Tahsilat", "Ödeme", "Virman", "Diğer"];
const CURRENCIES = ["TRY", "USD", "EUR", "GBP"];
const STATUSES = ["Aktif", "Pasif", "Beklemede"];

export default function AddTransactionPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState<TransactionForm>({
    companyId: "",
    date: new Date().toISOString().split("T")[0],
    documentNo: "",
    accountCode: "",
    accountName: "",
    description: "",
    debit: "",
    credit: "",
    transactionType: "",
    currency: "TRY",
    status: "Aktif",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<Company[]>("/companies").catch(() => []),
      api.get<Account[]>("/accounts").catch(() => []),
    ]).then(([comps, accs]) => {
      setCompanies(comps);
      setAccounts(accs);
    });
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    
    if (name === "accountSelect") {
      const selectedAcc = accounts.find(a => a.accountCode === value);
      if (selectedAcc) {
        setForm((prev) => ({ 
          ...prev, 
          accountCode: selectedAcc.accountCode,
          accountName: selectedAcc.accountName 
        }));
      } else {
        setForm((prev) => ({ ...prev, accountCode: "", accountName: "" }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.companyId) {
      setError("Lütfen bir firma seçin.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/transactions", {
        companyId: parseInt(form.companyId),
        date: new Date(form.date).toISOString(),
        documentNo: form.documentNo,
        accountCode: form.accountCode,
        accountName: form.accountName,
        description: form.description,
        debit: parseFloat(form.debit || "0"),
        credit: parseFloat(form.credit || "0"),
        transactionType: form.transactionType,
        entryMethod: "Manual",
        currency: form.currency,
        status: form.status,
      });
      setSuccess("İşlem başarıyla eklendi!");
      setForm({
        companyId: "",
        date: new Date().toISOString().split("T")[0],
        documentNo: "",
        accountCode: "",
        accountName: "",
        description: "",
        debit: "",
        credit: "",
        transactionType: "",
        currency: "TRY",
        status: "Aktif",
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "İşlem eklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="page-header" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>
          <ArrowLeft size={16} />
          Geri
        </button>
        <div>
          <h1 className="page-title">Finansal Kayıt Ekle</h1>
          <p className="page-subtitle">Manuel finansal işlem girişi</p>
        </div>
      </div>

      <div className="content-card" style={{ maxWidth: "800px" }}>
        <div className="content-card-header">
          <span className="content-card-title">İşlem Bilgileri</span>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Firma */}
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label" htmlFor="companyId">
                Firma <span style={{ color: "oklch(0.52 0.22 27)" }}>*</span>
              </label>
              <select
                id="companyId"
                name="companyId"
                className="form-select"
                value={form.companyId}
                onChange={handleChange}
                required
              >
                <option value="">Firma seçin…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tarih */}
            <div className="form-group">
              <label className="form-label" htmlFor="date">
                Tarih <span style={{ color: "oklch(0.52 0.22 27)" }}>*</span>
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="form-input"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Belge No */}
            <div className="form-group">
              <label className="form-label" htmlFor="documentNo">
                Belge No <span style={{ color: "oklch(0.52 0.22 27)" }}>*</span>
              </label>
              <input
                id="documentNo"
                name="documentNo"
                className="form-input"
                placeholder="FTR-2024-001"
                value={form.documentNo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label" htmlFor="accountSelect">
                Hesap Kodu / Adı
              </label>
              <select
                id="accountSelect"
                name="accountSelect"
                className="form-select"
                value={form.accountCode}
                onChange={handleChange}
              >
                <option value="">Hesap seçin…</option>
                {accounts.map((a) => (
                  <option key={a.accountCode} value={a.accountCode}>
                    {a.accountCode} - {a.accountName} ({a.accountGroup})
                  </option>
                ))}
              </select>
              {accounts.length === 0 && (
                <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
                  Hesap listesi boş. Önce "Hesap Planı Yükle" bölümünden Accounts excelini yükleyin.
                </p>
              )}
            </div>

            {/* Borç */}
            <div className="form-group">
              <label className="form-label" htmlFor="debit">
                Borç (Debit)
              </label>
              <input
                id="debit"
                name="debit"
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                placeholder="0.00"
                value={form.debit}
                onChange={handleChange}
              />
            </div>

            {/* Alacak */}
            <div className="form-group">
              <label className="form-label" htmlFor="credit">
                Alacak (Credit)
              </label>
              <input
                id="credit"
                name="credit"
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                placeholder="0.00"
                value={form.credit}
                onChange={handleChange}
              />
            </div>

            {/* İşlem Türü */}
            <div className="form-group">
              <label className="form-label" htmlFor="transactionType">
                İşlem Türü
              </label>
              <select
                id="transactionType"
                name="transactionType"
                className="form-select"
                value={form.transactionType}
                onChange={handleChange}
              >
                <option value="">Seçin…</option>
                {TRANSACTION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Para birimi */}
            <div className="form-group">
              <label className="form-label" htmlFor="currency">
                Para Birimi
              </label>
              <select
                id="currency"
                name="currency"
                className="form-select"
                value={form.currency}
                onChange={handleChange}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Durum */}
            <div className="form-group">
              <label className="form-label" htmlFor="status">
                Durum
              </label>
              <select
                id="status"
                name="status"
                className="form-select"
                value={form.status}
                onChange={handleChange}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Açıklama */}
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label" htmlFor="description">
                Açıklama
              </label>
              <input
                id="description"
                name="description"
                className="form-input"
                placeholder="İşlem açıklaması…"
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push("/transactions")}
            >
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} />
              {loading ? "Kaydediliyor…" : "İşlemi Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
