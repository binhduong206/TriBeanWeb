using Tribean.DTOs;
using Tribean.Repositories;

namespace Tribean.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repo;
    public CategoryService(ICategoryRepository repo)
    {
        _repo = repo;
    }
    public async Task<List<CategoryResponse>> GetCategoryQuantityDataAsync()
    {
        var categories = await _repo.GetCategoryQuantityAsync();
        return categories;
    }
}