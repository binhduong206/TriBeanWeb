using Tribean.DTOs;

namespace Tribean.Services;

public interface ICategoryService
{
    Task<List<CategoryResponse>> GetCategoryQuantityDataAsync();
}