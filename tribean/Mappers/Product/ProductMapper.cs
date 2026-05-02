using System.Linq.Expressions;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Tribean.DTOs;
using Tribean.Models;
using Tribean.Models.Enums;

namespace Tribean.Mappers;

public static class ProductMapper
{
    public static string baseUrl = "http://localhost:5262";
    public static Expression<Func<Product, ProductHomeResponse>> ToHomeBestSellerDto()
    {
        return p => new ProductHomeResponse
        {
            Id = p.Id,
            ProductName = p.ProductName,
            CategoryName = p.Category!.CategoryName,
            Price = p.Price,
            Discount = p.Discount,
            Description = p.Description,
            MainImgUrl = string.IsNullOrEmpty(p.MainImgUrl)
                ? null
                : baseUrl + p.MainImgUrl,
            Rating = p.Reviews
                .Select(r => (double?)r.Rating)
                .Average() ?? 0
        };
    }

    public static Expression<Func<Product, ProductResponse>> ToProductDto()
    {
        return p => new ProductResponse
        {
            Id = p.Id,
            ProductName = p.ProductName,
            CategoryName = p.Category!.CategoryName,
            Description = p.Description,
            Price = p.Price,
            Discount = p.Discount,
            MainImgUrl = string.IsNullOrEmpty(p.MainImgUrl)
        ? null
        : baseUrl + p.MainImgUrl,
            Rating = p.Reviews.Any()
            ? p.Reviews.Average(r => r.Rating)
            : 0,
            ReviewCount = p.Reviews.Count,
            QuantitySold = p.OrderDetails
                .Where(od => od.Order!.Status == OrderStatus.Delivered)
                .Sum(od => od.Quantity)
        };
    }
}