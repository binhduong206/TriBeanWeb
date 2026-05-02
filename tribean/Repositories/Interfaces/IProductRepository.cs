using Tribean.DTOs;
using Tribean.Helpers;

namespace Tribean.Repositories;

public interface IProductRepository
{
    Task<List<ProductResponse>> GetAllProductAsync(QueryObject query);
    Task<ProductResponse> GetProductByIdAsync(string productId);
}