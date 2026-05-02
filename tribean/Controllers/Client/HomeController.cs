using Microsoft.AspNetCore.Mvc;
using Tribean.Helpers;
using Tribean.Services;

namespace Tribean.Controllers;

[Route("api/home")]
[ApiController]
public class HomeController : ControllerBase
{
    private readonly IHomeService _homeService;
    public HomeController(IHomeService homeService)
    {
        _homeService = homeService;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var data = await _homeService.GetHomeProductBestSellerAsync();
        return Ok(data);
    }
}