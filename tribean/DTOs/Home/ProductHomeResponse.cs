using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Tribean.Models;

namespace Tribean.DTOs;

public class ProductHomeResponse
{
    public string Id { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public int Discount { get; set; }
    public string? MainImgUrl { get; set; }
    public double Rating { get; set; }
}