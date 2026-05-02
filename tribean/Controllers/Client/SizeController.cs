using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tribean.Data;

namespace Tribean.Controllers;

[ApiController]
[Route("api/sizes")]
public class SizeController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public SizeController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var sizes = await _db.Sizes
            .Select(s => new { s.Id, s.SizeName, s.Price })
            .ToListAsync();
        return Ok(sizes);
    }
}