namespace Tribean.Helpers;

public class QueryObject
{
    public string? Symbol { get; set; } = null;
    public string? ProductName { get; set; } = null;
    public string? CategoryName { get; set; } = null;
    public string? SortBy { get; set; } = null;
    public string? Price { get; set; } = null;
    public bool IsDecs { get; set; } = false;
    public int PageNumber { get; set; } = 1;
    public int PageSizeAll { get; set; } = 9;
    public int PageSizeBestSeller { get; set; } = 5;
}