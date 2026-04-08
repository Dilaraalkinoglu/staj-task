using backend.DTOs.Dashboard;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ICompanyRepository _companyRepository;
        private readonly ITransactionRepository _transactionRepository;

        public DashboardService(ICompanyRepository companyRepository, ITransactionRepository transactionRepository)
        {
            _companyRepository = companyRepository;
            _transactionRepository = transactionRepository;
        }

        public async Task<DashboardResponseDto> GetDashboardDataAsync()
        {
            var companies = await _companyRepository.GetAllAsync();
            var transactions = await _transactionRepository.GetAllAsync();

            var totalCompanies = companies.Count;
            var activeCompanies = companies.Count(c => c.IsActive);
            var totalRecords = transactions.Count;
            var totalDebit = transactions.Sum(t => t.Debit);
            var totalCredit = transactions.Sum(t => t.Credit);
            var netEffect = transactions.Sum(t => t.NetEffect);

            var totalIncome = totalCredit;
            var totalExpense = totalDebit;

            var excelRecords = transactions.Count(t =>
                string.Equals(t.EntryMethod?.Trim(), "ExcelUpload", StringComparison.OrdinalIgnoreCase));

            var manualRecords = transactions.Count(t =>
                string.Equals(t.EntryMethod?.Trim(), "Manual", StringComparison.OrdinalIgnoreCase));
                        
            var summary = new DashboardSummaryDto
            {
                TotalCompanies = totalCompanies,
                ActiveCompanies = activeCompanies,
                TotalRecords = totalRecords,
                TotalDebit = totalDebit,
                TotalCredit = totalCredit,
                NetEffect = netEffect,
                TotalIncome = totalIncome,
                TotalExpense = totalExpense,
                ExcelUploadedRecords = excelRecords,
                ManualEnteredRecords = manualRecords
            };

            var monthlyNetEffects = transactions
                .GroupBy(t => t.Date.Month)
                .Select(g => new MonthlyNetEffectDto
                {
                    Month = GetMonthName(g.Key),
                    Net = g.Sum(t => t.NetEffect)
                })
                .OrderBy(x => x.Month)
                .ToList();

            var companySummaries = transactions
                .GroupBy(t => new 
                {  t.CompanyId,
                    CompanyName = t.Company?.Name ?? "Bilinmeyen Firma" 
                })
                .Select(g => new CompanySummaryDto
                {
                    CompanyName = g.Key.CompanyName,
                    RecordCount = g.Count(),
                    TotalDebit = g.Sum(t => t.Debit),
                    TotalCredit = g.Sum(t => t.Credit),
                    Net = g.Sum(t => t.NetEffect)
                })
                .ToList();

            return new DashboardResponseDto
            {
                Summary = summary,
                MonthlyNetEffects = monthlyNetEffects,
                CompanySummaries = companySummaries
            };
        }

        private string GetMonthName(int month)
        {
            return month switch
            {
                1 => "January",
                2 => "February",
                3 => "March",
                4 => "April",
                5 => "May",
                6 => "June",
                7 => "July",
                8 => "August",
                9 => "September",
                10 => "October",
                11 => "November",
                12 => "December",
                _ => ""
            };
        }
    }
}