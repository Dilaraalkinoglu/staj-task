"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { Search, Plus, ChevronRight } from "lucide-react";

interface Company {
  id: number;
  name: string;
  taxNumber: string;
  city: string;
  sector: string;
  isActive: boolean;
  createdAt: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filtered, setFiltered] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Company[]>("/companies")
      .then((data) => {
        setCompanies(data);
        setFiltered(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      setFiltered(companies);
    } else {
      setFiltered(
        companies.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.taxNumber.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q) ||
            c.sector.toLowerCase().includes(q)
        )
      );
    }
  }, [search, companies]);

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Firmalar</h1>
        <p className="page-subtitle">
          Kayıtlı tüm firmalar — {companies.length} firma
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="content-card">
        <div className="content-card-header">
          <div className="search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Firma ara…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/add/company" className="btn btn-primary btn-sm">
            <Plus size={15} />
            Firma Ekle
          </Link>
        </div>

        {loading ? (
          <div className="empty-state">
            <span className="loading-spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>Firma bulunamadı.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Firma Adı</th>
                  <th>Vergi No</th>
                  <th>Şehir</th>
                  <th>Sektör</th>
                  <th>Durum</th>
                  <th>Kayıt Tarihi</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }}>
                      {c.id}
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                      {c.taxNumber}
                    </td>
                    <td>{c.city}</td>
                    <td>{c.sector}</td>
                    <td>
                      <span className={`badge ${c.isActive ? "badge-green" : "badge-gray"}`}>
                        {c.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                      {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td>
                      <Link
                        href={`/companies/${c.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        <ChevronRight size={15} />
                        Detay
                      </Link>
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
