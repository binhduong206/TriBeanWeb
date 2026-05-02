using Microsoft.EntityFrameworkCore;
using Tribean.Data;
using Tribean.DTOs;
using Tribean.Mappers;

namespace Tribean.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly ApplicationDbContext _context;
    public CategoryRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<List<CategoryResponse>> GetCategoryQuantityAsync()
    {
        var categories = await _context.Categories.Select(CategoryMapper.ToCategoryCountDto()).ToListAsync();
        return categories;
    }
}