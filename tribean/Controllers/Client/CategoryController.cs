using Microsoft.AspNetCore.Mvc;
using Tribean.Services;

namespace Tribean.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoryController : ControllerBase
{
    private readonly ICategoryService _service;
    public CategoryController(ICategoryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult> GetCategoryQuantity()
    {
        var data = await _service.GetCategoryQuantityDataAsync();
        return Ok(data);
    }
}