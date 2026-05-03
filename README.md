# 🌰 Web Bán Nước TriBean

## 📌 Giới Thiệu

**TriBean** là một nền tảng thương mại điện tử chuyên bán nước uống trực tuyến với chức năng đặt hàng toàn diện. Hệ thống được chia thành hai phần chính cho Admin và Client.

### Tính năng chính:

- **Phía Admin:**
  - Quản lý tài khoản người dùng
  - Quản lý danh mục sản phẩm
  - Quản lý sản phẩm và giá bán
  - Quản lý đơn hàng
  - Quản lý khuyến mãi/giảm giá
  - Xem báo cáo doanh số

- **Phía Client:**
  - Đăng nhập/Đăng ký tài khoản
  - Duyệt sản phẩm theo danh mục
  - Xem chi tiết sản phẩm
  - Đánh giá sản phẩm
  - Quản lý giỏ hàng
  - Đặt hàng
  - Quản lý đơn hàng
  - Theo dõi lịch sử mua hàng

---

## 🚀 Công Nghệ Sử Dụng

| Lớp                | Công Nghệ                                                           |
| ------------------ | ------------------------------------------------------------------- |
| **Backend**        | ASP.NET Core 10 Web API                                             |
| **Frontend**       | HTML5, CSS3, JavaScript (Vanilla)                                   |
| **Database**       | SQL Server                                                          |
| **Authentication** | JWT (JSON Web Tokens)                                               |
| **ORM**            | Entity Framework Core 10                                            |
| **Additional**     | BCrypt.Net (mã hóa mật khẩu), Scalar.AspNetCore (API documentation) |

---

## 📂 Cấu Trúc Thư Mục

```
BaoCaoWebNangCao/
├── README.md (file này)
├── front-end/                    # Frontend (giao diện client)
│   ├── index.html               # Trang chủ
│   ├── assets/                  # Hình ảnh (banner, logo)
│   ├── css/                     # Stylesheet
│   │   ├── base/               # CSS cơ bản
│   │   ├── components/         # CSS cho components
│   │   ├── layouts/            # CSS layout
│   │   └── pages/              # CSS cho từng page
│   ├── js/                      # JavaScript
│   │   ├── api/                # Gọi API
│   │   ├── components/         # JavaScript components
│   │   ├── layouts/            # Layout scripts
│   │   ├── middleware/         # Middleware (auth, etc)
│   │   ├── pages/              # Page-specific scripts
│   │   ├── services/           # Services
│   │   └── utils/              # Utility functions
│   ├── layouts/                 # Template HTML layouts
│   ├── pages/                   # Page templates
│   │   └── auth/               # Trang đăng nhập/đăng ký
│   └── Shared/                  # Shared components
│
└── tribean/                      # Backend (ASP.NET Core)
    ├── Program.cs              # Cấu hình ứng dụng
    ├── Tribean.csproj          # File cấu hình dự án
    ├── tribean.sln             # Solution file
    ├── appsettings.json        # Cấu hình production
    ├── appsettings.Development.json  # Cấu hình development
    ├── Controllers/            # API Controllers
    │   ├── Admin/              # Các controller cho Admin
    │   └── Client/             # Các controller cho Client
    ├── Models/                 # Entity models
    │   ├── User.cs
    │   ├── Product.cs
    │   ├── Category.cs
    │   ├── Cart.cs
    │   ├── Order.cs
    │   ├── Review.cs
    │   ├── Discount.cs
    │   └── Enums/              # Enum definitions
    ├── DTOs/                   # Data Transfer Objects
    │   ├── Auth/
    │   ├── Product/
    │   ├── Cart/
    │   ├── Order/
    │   ├── Category/
    │   └── Review/
    ├── Services/               # Business logic
    ├── Repositories/           # Data access layer
    │   └── Interfaces/         # Repository interfaces
    ├── Data/                   # Database context
    │   └── ApplicationDbContext.cs
    ├── Mappers/                # DTO mapping
    ├── Middlewares/            # Custom middlewares
    ├── Migrations/             # Database migrations
    ├── Helpers/                # Helper classes
    ├── Routers/                # Routing configuration
    ├── Views/                  # Razor views (if needed)
    └── wwwroot/                # Static files
```

---

## ⚙️ Yêu Cầu Hệ Thống

- **Windows/Linux/macOS**
- **.NET SDK 10** ([Tải tại đây](https://dotnet.microsoft.com/download))
- **Visual Studio Code** hoặc **Visual Studio 2022**
- **SQL Server 2019+** hoặc **SQL Server Express**
- **Node.js 18+** (tùy chọn, cho các công cụ frontend)

---

## 🔧 Hướng Dẫn Cài Đặt & Chạy

### 1. Clone/Tải Dự Án

```bash
# Nếu sử dụng Git
git clone https://github.com/binhduong206/TriBeanWeb.git

# Hoặc giải nén file ZIP
unzip code.zip
```

### 2. Cấu Hình Database

**Bước 1:** Mở file `tribean/appsettings.json`

**Bước 2:** Sửa `DefaultConnection` (dòng khoảng 2-3):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=TriBeanCoffeeDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;"
  }
}
```

**Nếu dùng SQL Server khác**, thay `(localdb)\\MSSQLLocalDB` bằng tên server của bạn:

```json
"DefaultConnection": "Server=YOUR_SERVER_NAME;Database=TriBeanCoffeeDB;User Id=sa;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
```

### 3. Khôi Phục Database

Mở Terminal/PowerShell trong thư mục `tribean`:

```bash
# Khôi phục dependencies
dotnet restore

# Chạy migrations để tạo database
dotnet ef database update
```

### 4. Chạy Backend

```bash
# Từ thư mục tribean
dotnet run

# Hoặc chạy và watch cho changes
dotnet watch
```

Backend sẽ chạy tại: `https://localhost:5001` hoặc `http://localhost:5000`

### 5. Chạy Frontend

Mở file `front-end/index.html` bằng:

- Live Server extension trong VS Code, hoặc
- Trực tiếp mở file trong trình duyệt

---

## 📚 API Documentation

Khi backend đang chạy, truy cập:

- **Swagger UI**: `https://localhost:5001/swagger` (nếu có)
- **Scalar API**: `https://localhost:5001/scalar/v1` (OpenAPI documentation)

---

## 🔐 Authentication

Hệ thống sử dụng **JWT (JSON Web Tokens)** cho authentication:

- Client đăng nhập → nhận JWT token
- Token được lưu trong localStorage
- Mỗi request đến API phải kèm token trong header: `Authorization: Bearer <token>`
- Refresh token được lưu trong database để cấp lại token khi hết hạn

---

## 🗄️ Database Schema

Các bảng chính:

- **Users** - Thông tin người dùng
- **Products** - Sản phẩm
- **Categories** - Danh mục sản phẩm
- **Carts** & **CartItems** - Giỏ hàng
- **Orders** & **OrderDetails** - Đơn hàng
- **Reviews** - Đánh giá sản phẩm
- **Discounts** - Khuyến mãi
- **RefreshTokens** - Refresh tokens
- **Roles** - Phân quyền

Xem chi tiết migrations trong thư mục `tribean/Migrations/`

---

## 🧪 Testing

### Kiểm tra API

Dùng **Postman** hoặc **Thunder Client** (VS Code extension):

1. Đăng nhập (POST `/api/auth/login`)
2. Copy token nhận được
3. Gán token vào Authorization header cho các request khác

### Kiểm tra Frontend

Mở trình duyệt, kiểm tra:

- Đăng nhập/Đăng ký
- Duyệt sản phẩm
- Thêm vào giỏ
- Thanh toán

---

## 🚨 Troubleshooting

| Vấn đề                            | Giải pháp                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `DefaultConnection` chưa cấu hình | Kiểm tra `appsettings.json` trong thư mục `tribean`                                         |
| Database không tạo được           | Kiểm tra SQL Server đang chạy, chạy `dotnet ef database update`                             |
| Port 5001 đang bị chiếm           | Đổi port trong `launchSettings.json` hoặc dùng `dotnet run --urls "https://localhost:5002"` |
| CORS error                        | Kiểm tra cấu hình CORS trong `Program.cs`                                                   |
| JWT token lỗi                     | Xóa token cũ trong localStorage, đăng nhập lại                                              |

---

## 📝 Ghi Chú

- Mật khẩu được mã hóa bằng **BCrypt**
- Session timeout: **30 phút** (cấu hình trong `Program.cs`)
- Tất cả dữ liệu gửi/nhận qua API đều phải ở format JSON
- Database được quản lý qua **Entity Framework Core Migrations**

---

## 👥 Tác Giả

Dự án này được phát triển như một bài tập/đồ án web.

---

## 📄 License

MIT License - Tự do sử dụng cho mục đích học tập và thương mại.
