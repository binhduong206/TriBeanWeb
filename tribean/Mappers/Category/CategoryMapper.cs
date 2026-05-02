using System.Linq.Expressions;
using Tribean.DTOs;
using Tribean.Models;

namespace Tribean.Mappers;

public static class CategoryMapper
{
    public static Expression<Func<Category, CategoryResponse>> ToCategoryCountDto()
    {
        return c => new CategoryResponse
        {
            CategoryName = c.CategoryName,
            Quantity = c.Products.Count()
        };
    }
}