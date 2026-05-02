using Microsoft.Identity.Client;
using Tribean.DTOs;

namespace Tribean.Repositories;

public interface ICategoryRepository
{
    Task<List<CategoryResponse>> GetCategoryQuantityAsync();
}