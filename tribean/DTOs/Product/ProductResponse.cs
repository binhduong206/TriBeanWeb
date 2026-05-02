using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Tribean.Models;

namespace Tribean.DTOs;

public class ProductResponse
{
    public string Id { get; set; } = string.Empty;
    public string? MainImgUrl { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int? Discount { get; set; } = null; // Mặc định là 0%
    public double Rating { get; set; }
    public string? CategoryName { get; set; }
    public int ReviewCount { get; set; }      // Số lượng đánh giá
    public int QuantitySold { get; set; }     // Số lượng đã bán
}