using Tribean.DTOs;
using Tribean.Helpers;
using Tribean.Repositories;

namespace Tribean.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;
    public ProductService(IProductRepository repo)
    {
        _repo = repo;
    }

    public async Task<ProductResponse> GetProductDataByIdAsync(string Id)
    {
        var product = await _repo.GetProductByIdAsync(Id);
        return product;
    }

    public async Task<List<ProductResponse>> GetAllProductDataAsync(QueryObject query)
    {
        var products = await _repo.GetAllProductAsync(query);
        if (products == null)
        {
            return null;
        }
        return products;
    }
}