using Microsoft.AspNetCore.Mvc;
using Tribean.Helpers;
using Tribean.Services;

namespace Tribean.Controllers;

[Route("api/products")]
[ApiController]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;
    public ProductController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(string id)
    {
        var data = await _productService.GetProductDataByIdAsync(id);
        return Ok(data);
    }

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] QueryObject query)
    {
        var data = await _productService.GetAllProductDataAsync(query);
        if (data == null) return null;
        return Ok(data);
    }
}