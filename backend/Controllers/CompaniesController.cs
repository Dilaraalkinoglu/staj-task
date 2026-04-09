using backend.DTOs.Company;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/companies")]
    [Authorize]
    public class CompaniesController : ControllerBase
    {
        private readonly ICompanyService _companyService;

        public CompaniesController(ICompanyService companyService)
        {
            _companyService = companyService;
        }

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            var companies = await _companyService.GetAllAsync();
            return Ok(companies);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            var company = await _companyService.GetByIdAsync(id);

            if (company == null)
                return NotFound(new { message = "Firma bulunamadı."});

            return Ok(company);
        }

        [HttpGet("search")]
        public async Task<ActionResult> SearchByName([FromQuery] string name)
        {
            var companies = await _companyService.SearchByNameAsync(name);
            return Ok(companies);
        }

        [HttpPost]
        public async Task<ActionResult> Add(CompanyCreateDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdCompany = await _companyService.AddAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = createdCompany.Id }, createdCompany);
        }

        [HttpPost("upload-excel")]
        public async Task<ActionResult> UploadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Dosya boş.");
            }

            ExcelPackage.License.SetNonCommercialPersonal("Dilara Alkinoglu");
            
            using var stream = new MemoryStream();
            file.CopyTo(stream);
            stream.Position = 0;

            using var package = new ExcelPackage(stream);
            var isNewFormat = false;
            var worksheet = package.Workbook.Worksheets["Companies"];
            if (worksheet != null)
            {
                isNewFormat = true;
            }
            else
            {
                worksheet = package.Workbook.Worksheets["Upload_Companies_Template"];
            }
            
            if (worksheet == null)
            {
                return BadRequest("Excel dosyasında 'Companies' veya 'Upload_Companies_Template' sayfası bulunamadı.");
            }

            var rowCount = worksheet.Dimension?.Rows ?? 0;
            var columnCount = worksheet.Dimension?.Columns ?? 0;

            var headers = new List<string>();
            for (int col = 1; col <= columnCount; col++)
            {
                headers.Add(worksheet.Cells[1, col].Text); // önce başlık satırını oku
            }

            var addedCompanies = new List<object>();
            var skippedCompanies = new List<object>();
            
            for (int row = 2; row <= rowCount; row++)
            {
                string name, taxNumber, city, sector, isActiveText;

                if (isNewFormat)
                {
                    name = worksheet.Cells[row, 2].Text;
                    taxNumber = worksheet.Cells[row, 3].Text;
                    city = worksheet.Cells[row, 4].Text;
                    sector = worksheet.Cells[row, 5].Text;
                    isActiveText = worksheet.Cells[row, 6].Text;
                }
                else
                {
                    name = worksheet.Cells[row, 1].Text;
                    taxNumber = worksheet.Cells[row, 2].Text;
                    city = worksheet.Cells[row, 3].Text;
                    sector = worksheet.Cells[row, 4].Text;
                    isActiveText = worksheet.Cells[row, 5].Text;
                }

                if (string.IsNullOrWhiteSpace(name))
                {
                    continue; // Firma adı boşsa bu satırı atla
                }

                var dto = new CompanyCreateDto
                {
                    Name = name,
                    TaxNumber = taxNumber,
                    City = city,
                    Sector = sector,
                    IsActive = isActiveText.Trim().ToLower() == "true"
                };

                

                try
                {
                    var createdCompany = await _companyService.AddAsync(dto);

                    addedCompanies.Add(new
                    {
                        createdCompany.Id,
                        createdCompany.Name,
                        createdCompany.TaxNumber
                    });
                }
                catch (Exception ex)
                {
                    skippedCompanies.Add(new
                    {
                        Name = dto.Name,
                        TaxNumber = dto.TaxNumber,
                        Reason = ex.Message
                    });
                }
            }

            return Ok(new
            {
                Message = "Excel verileri işlendi.",
                AddedCount = addedCompanies.Count,
                SkippedCount = skippedCompanies.Count,
                AddedCompanies = addedCompanies,
                SkippedCompanies = skippedCompanies
            });
            


        }
    }
}
