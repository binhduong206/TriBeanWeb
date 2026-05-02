using Tribean.Data;
using Tribean.DTOs;
using Tribean.Mappers;
using Tribean.Models;
using Microsoft.EntityFrameworkCore;
using Tribean.Helpers;

namespace Tribean.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly ApplicationDbContext _context;
    public ProductRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductResponse>> GetAllProductAsync(QueryObject query)
    {
        var productQuery = _context.Products.Where(p => p.Status).AsQueryable();

        // filter by category name
        if (!string.IsNullOrEmpty(query.CategoryName))
        {
            productQuery = productQuery.Where(p => p.Category.CategoryName == query.CategoryName);
        }
        if (!string.IsNullOrEmpty(query.ProductName))
        {
            productQuery = productQuery.Where(p => p.ProductName.Contains(query.ProductName));
        }
        if (!string.IsNullOrEmpty(query.Price))
        {
            productQuery = productQuery.Where(p => p.Price >= 0 && p.Price <= Decimal.Parse(query.Price));
        }
        if (!string.IsNullOrEmpty(query.SortBy) && query.SortBy == "price-asc")
        {   // finalPrice = price - (price * discount / 100)
            productQuery = productQuery.OrderBy(p => p.Price - (p.Price * p.Discount / 100));
        }
        if (!string.IsNullOrEmpty(query.SortBy) && query.SortBy == "price-desc")
        {
            productQuery = productQuery.OrderByDescending(p => p.Price - (p.Price * p.Discount / 100));
        }
        if (!string.IsNullOrEmpty(query.SortBy) && query.SortBy == "rating")
        {
            productQuery = productQuery.OrderByDescending(p => p.Reviews.Average(r => (double?)r.Rating) ?? 0);
        }
        var skipNumber = (query.PageNumber - 1) * (query.PageSizeAll);
        return await productQuery.Skip(skipNumber).Take(query.PageSizeAll).Select(ProductMapper.ToProductDto()).ToListAsync();
    }

    public async Task<ProductResponse?> GetProductByIdAsync(string productId)
    {
        return await _context.Products
            .Where(p => p.Id == productId)
            .Select(ProductMapper.ToProductDto())
            .FirstOrDefaultAsync();
    }

}