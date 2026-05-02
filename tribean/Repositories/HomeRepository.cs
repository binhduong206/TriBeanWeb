using Tribean.Data;
using Tribean.DTOs;
using Tribean.Mappers;
using Tribean.Models;
using Microsoft.EntityFrameworkCore;
using Tribean.Helpers;

namespace Tribean.Repositories;

public class HomeRepository : IHomeRepository
{
    private readonly ApplicationDbContext _context;
    public HomeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // Get best seller products
    public async Task<List<ProductHomeResponse>> GetBestSellerProductAsync()
    {
        var products = await _context.Products.Where(p => p.Status && p.Reviews.Any() && p.Reviews.Average(r => r.Rating) >= 4.8)
            .OrderByDescending(p => p.Reviews.Average(r => r.Rating))
            .Select(ProductMapper.ToHomeBestSellerDto())
            .ToListAsync();

        return products;
    }

    public async Task<List<ProductHomeResponse>> GetFeaturedProductAsync(QueryObject query)
    {
        var products = _context.Products.Where(p => p.Status).Select(ProductMapper.ToHomeBestSellerDto());

        var skipNumber = (query.PageNumber - 1) * query.PageSizeBestSeller;

        return await products.Skip(skipNumber).Take(query.PageSizeBestSeller).ToListAsync();
        // return await _context.Products
        //     .Where(p => p.Status)
        //     .OrderByDescending(p => p.CreatedAt)
        //     .Take(8)
        //     .Select(ProductMapper.ToHomeDto())
        //     .ToListAsync();
    }
}