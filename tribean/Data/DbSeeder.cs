using Microsoft.EntityFrameworkCore;
using Tribean.Models;

namespace Tribean.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            // 1. Seed Roles
            if (!context.Roles.Any())
            {
                context.Roles.AddRange(
                    new Role { RoleName = "Admin" },
                    new Role { RoleName = "User" }
                );

                await context.SaveChangesAsync();
            }

            // 2. Seed Admin
            if (!context.Users.Any(u => u.Email == "admin@gmail.com"))
            {
                var adminRole = await context.Roles
                    .FirstOrDefaultAsync(r => r.RoleName == "Admin");

                var admin = new User
                {
                    UserName = "admin",
                    Email = "admin@gmail.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("admin"),
                    RoleId = adminRole!.Id
                };

                context.Users.Add(admin);
                await context.SaveChangesAsync();
            }
        }
    }
}