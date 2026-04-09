"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Transaction {
  id: number;
  companyId: number;
  debit: number;
  credit: number;
  transactionType: string;
  entryMethod: string;
  date: string;
}

interface Company {
  id: number;
  name: string;
  isActive?: boolean;
}

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [companiesData, transactionsData] = await Promise.all([
          api.get<Company[]>("/companies"),
          api.get<Transaction[]>("/transactions")
        ]);

        setCompanies(companiesData);
        setTransactions(transactionsData);
      } catch (err) {
        console.error("Dashboard verileri yüklenirken hata oluştu:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const formatTRY = (val: number) =>
    new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.isActive).length;
  const totalTransactions = transactions.length;
  const totalDebit = transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
  const totalCredit = transactions.reduce((sum, t) => sum + (t.credit || 0), 0);
  const netEffect = totalCredit - totalDebit;

  const totalIncome = transactions
    .filter(t => t.transactionType?.toLowerCase().includes("gelir") || t.credit > 0)
    .reduce((sum, t) => sum + (t.credit || 0), 0);
  const totalExpense = transactions
    .filter(t => t.transactionType?.toLowerCase().includes("gider") || t.debit > 0)
    .reduce((sum, t) => sum + (t.debit || 0), 0);

  const excelRecords = transactions.filter(t => t.entryMethod === "ExcelUpload").length;
  const manualRecords = totalTransactions - excelRecords;

  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const monthlyData = months.map((month, index) => {
    const txsInMonth = transactions.filter(t => {
      if (!t.date) return false;
      const d = new Date(t.date);
      return d.getMonth() === index;
    });
    const debit = txsInMonth.reduce((acc, t) => acc + (t.debit || 0), 0);
    const credit = txsInMonth.reduce((acc, t) => acc + (t.credit || 0), 0);
    return {
      month,
      net: credit - debit
    };
  }).filter(m => m.net !== 0 || transactions.some(t => new Date(t.date).getMonth() === months.indexOf(m.month)));

  const companySummary = companies.map(company => {
    const companyTxs = transactions.filter(t => t.companyId === company.id);
    const debit = companyTxs.reduce((sum, t) => sum + (t.debit || 0), 0);
    const credit = companyTxs.reduce((sum, t) => sum + (t.credit || 0), 0);
    return {
      name: company.name,
      count: companyTxs.length,
      debit,
      credit,
      net: credit - debit
    };
  }).filter(c => c.count > 0);

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Genel özet durumları aşağıdan görüntüleyebilirsin.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", gap: "2rem", width: "100%" }}>
          <div className="content-card" style={{ flex: 1, minHeight: "400px" }}>
            <div className="h-full w-full bg-slate-100 animate-pulse rounded"></div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
          
          {/* Sol Kolon: Dashboard Özet */}
          <div className="content-card" style={{ flex: "1 1 480px", maxWidth: "600px", padding: 0, overflow: "hidden" }}>
            <div 
              style={{ 
                backgroundColor: "#e2f0fd", 
                color: "#004899", 
                padding: "1rem 1.5rem",
                borderBottom: "1px solid #cce1fa",
                fontWeight: 600,
                fontSize: "1.1rem"
              }}
            >
              Dashboard Özet
            </div>
            
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[#e2f0fd]">
                <tr className="hover:bg-[#f8faff] transition-colors">
                  <td className="py-4 px-6 text-[#004899] font-medium">Toplam Firma</td>
                  <td className="py-4 px-6 text-right font-semibold">{totalCompanies}</td>
                </tr>
                <tr className="hover:bg-[#f8faff] transition-colors bg-[#fbfdfa]">
                  <td className="py-4 px-6 text-[#004899] font-medium">Aktif Firma</td>
                  <td className="py-4 px-6 text-right font-semibold">{activeCompanies}</td>
                </tr>
                <tr className="hover:bg-[#f8faff] transition-colors">
                  <td className="py-4 px-6 text-[#004899] font-medium">Toplam Kayıt</td>
                  <td className="py-4 px-6 text-right font-semibold">{totalTransactions}</td>
                </tr>
                <tr className="hover:bg-[#f8faff] transition-colors bg-[#fbfdfa]">
                  <td className="py-4 px-6 text-[#004899] font-medium">Toplam Borç</td>
                  <td className="py-4 px-6 text-right font-semibold text-red-600">{formatTRY(totalDebit)}</td>
                </tr>
                <tr className="hover:bg-[#f8faff] transition-colors">
                  <td className="py-4 px-6 text-[#004899] font-medium">Toplam Alacak</td>
                  <td className="py-4 px-6 text-right font-semibold text-emerald-600">{formatTRY(totalCredit)}</td>
                </tr>
                
                <tr className="bg-[#e2f0fd]/50 border-t-2 border-[#b5d6fa]">
                  <td className="py-4 px-6 text-[#004899] font-bold text-base">Net Etki</td>
                  <td className={`py-4 px-6 text-right font-bold text-base ${netEffect < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatTRY(netEffect)}</td>
                </tr>
                
                <tr className="hover:bg-[#f8faff] transition-colors">
                  <td className="py-4 px-6 text-muted-foreground font-medium">Gelir Toplamı</td>
                  <td className="py-4 px-6 text-right font-semibold">{formatTRY(totalIncome)}</td>
                </tr>
                <tr className="hover:bg-[#f8faff] transition-colors bg-[#fbfdfa]">
                  <td className="py-4 px-6 text-muted-foreground font-medium">Gider Toplamı</td>
                  <td className="py-4 px-6 text-right font-semibold">{formatTRY(totalExpense)}</td>
                </tr>
                <tr className="hover:bg-[#f8faff] transition-colors">
                  <td className="py-4 px-6 text-muted-foreground font-medium">Excel İle Yüklenen</td>
                  <td className="py-4 px-6 text-right font-semibold">{excelRecords}</td>
                </tr>
                <tr className="hover:bg-[#f8faff] transition-colors bg-[#fbfdfa]">
                  <td className="py-4 px-6 text-muted-foreground font-medium">Manuel Girilen</td>
                  <td className="py-4 px-6 text-right font-semibold">{manualRecords}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sağ Kolon: Butonlar */}
          <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            <div className="content-card" style={{ padding: "2rem", textAlign: "center", backgroundColor: "#f8faff", border: "1px dashed #b5d6fa" }}>
              <p className="text-[#004899] font-medium mb-4">Daha detaylı analizler için</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Aylık Net Etki Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      style={{ backgroundColor: "#004899", color: "white", padding: "1.5rem" }}
                    >
                      Aylık Net Etki Raporu
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md border-0 p-0 overflow-hidden">
                    <div style={{ backgroundColor: "#e2f0fd", padding: "1.25rem 1.5rem" }}>
                      <DialogTitle style={{ color: "#004899", fontSize: "1.25rem" }}>Aylık Net Etki</DialogTitle>
                    </div>
                    <div className="p-6">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-muted-foreground">
                            <th className="py-3 px-2 font-medium">Ay</th>
                            <th className="py-3 px-2 text-right font-medium">Net Değer</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {monthlyData.length > 0 ? monthlyData.map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-2 text-[#004899] font-medium">{m.month}</td>
                              <td className={`py-3 px-2 text-right font-semibold ${m.net < 0 ? 'text-red-500' : 'text-emerald-500'}`}>{formatTRY(m.net)}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={2} className="py-6 text-center text-muted-foreground">Kayıt bulunamadı.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Firma Bazlı Özet Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="w-full" 
                      style={{ borderColor: "#004899", color: "#004899", padding: "1.5rem", backgroundColor: "white" }}
                    >
                      Firma Bazlı Özet Tablosu
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl border-0 p-0 overflow-hidden">
                    <div style={{ backgroundColor: "#e2f0fd", padding: "1.25rem 1.5rem" }}>
                      <DialogTitle style={{ color: "#004899", fontSize: "1.25rem" }}>Firma Bazlı Özet</DialogTitle>
                    </div>
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                      <table className="w-full text-sm relative">
                        <thead className="sticky top-[-1.5rem] z-10 bg-white border-b shadow-sm">
                          <tr className="text-left text-muted-foreground">
                            <th className="py-4 px-3 font-medium">Firma</th>
                            <th className="py-4 px-3 font-medium text-right">İşlem</th>
                            <th className="py-4 px-3 font-medium text-right">Toplam Borç</th>
                            <th className="py-4 px-3 font-medium text-right">Toplam Alacak</th>
                            <th className="py-4 px-3 font-medium text-right">Net Bakiye</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 relative z-0">
                          {companySummary.length > 0 ? companySummary.map((c, idx) => (
                            <tr key={idx} className="hover:bg-[#f8faff] transition-colors">
                              <td className="py-4 px-3 font-medium text-[#004899]">{c.name}</td>
                              <td className="py-4 px-3 text-right text-muted-foreground">{c.count}</td>
                              <td className="py-4 px-3 text-right font-medium text-red-600">{formatTRY(c.debit)}</td>
                              <td className="py-4 px-3 text-right font-medium text-emerald-600">{formatTRY(c.credit)}</td>
                              <td className={`py-4 px-3 text-right font-bold ${c.net < 0 ? 'text-red-500' : 'text-emerald-500'}`}>{formatTRY(c.net)}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Kayıt bulunamadı.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

          </div>

        </div>
      )}
    </AppLayout>
  );
}