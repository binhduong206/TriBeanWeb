using System.Buffers.Text;
using Tribean.DTOs.Auth;
using Tribean.Models;

namespace Tribean.Mappers
{
    public static class AuthMapper
    {
        public static string baseUrl = "http://localhost:5262";

        public static UserInfoDto ToUserInfoDto(this User user)
        {
            if (user == null) return null;

            return new UserInfoDto
            {
                UserId = user.Id,
                FullName = $"{user.FirstName} {user.LastName}",
                Avatar = baseUrl + user.AvatarUrl
            };
        }
    }
}