using Tribean.DTOs;
using Tribean.Helpers;

namespace Tribean.Services;

public interface IProductService
{
    Task<List<ProductResponse>> GetAllProductDataAsync(QueryObject query);
    Task<ProductResponse> GetProductDataByIdAsync(string Id);
}