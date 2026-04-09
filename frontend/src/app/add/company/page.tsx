"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { Save, ArrowLeft } from "lucide-react";

interface CompanyForm {
  name: string;
  taxNumber: string;
  city: string;
  sector: string;
  isActive: boolean;
}

export default function AddCompanyPage() {
  const router = useRouter();
  const [form, setForm] = useState<CompanyForm>({
    name: "",
    taxNumber: "",
    city: "",
    sector: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.target as HTMLInputElement;
    const value =
      target.type === "checkbox" ? target.checked : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/companies", form);
      setSuccess("Firma başarıyla eklendi!");
      setForm({ name: "", taxNumber: "", city: "", sector: "", isActive: true });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Firma eklenemedi.");
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
          <h1 className="page-title">Firma Ekle</h1>
          <p className="page-subtitle">Yeni firma kaydı oluşturun</p>
        </div>
      </div>

      <div className="content-card" style={{ maxWidth: "700px" }}>
        <div className="content-card-header">
          <span className="content-card-title">Firma Bilgileri</span>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Firma Adı <span style={{ color: "oklch(0.52 0.22 27)" }}>*</span>
              </label>
              <input
                id="name"
                name="name"
                className="form-input"
                placeholder="ABC Ticaret A.Ş."
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="taxNumber">
                Vergi No <span style={{ color: "oklch(0.52 0.22 27)" }}>*</span>
              </label>
              <input
                id="taxNumber"
                name="taxNumber"
                className="form-input"
                placeholder="1234567890"
                value={form.taxNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="city">
                Şehir <span style={{ color: "oklch(0.52 0.22 27)" }}>*</span>
              </label>
              <input
                id="city"
                name="city"
                className="form-input"
                placeholder="İstanbul"
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sector">
                Sektör <span style={{ color: "oklch(0.52 0.22 27)" }}>*</span>
              </label>
              <input
                id="sector"
                name="sector"
                className="form-input"
                placeholder="Tekstil"
                value={form.sector}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Durum</label>
              <div className="form-checkbox-row">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="isActive" style={{ fontSize: "0.875rem", cursor: "pointer" }}>
                  Aktif firma
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push("/companies")}
            >
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} />
              {loading ? "Kaydediliyor…" : "Firmayı Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
