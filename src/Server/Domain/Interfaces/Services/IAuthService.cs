using Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces.Services
{
    public interface IAuthService
    {
        string GenerateVerificationCode();
        bool VerifyPassword(string password, string passwordHash);
        string HashPassword(string password);
        string GenerateJwtToken(User user);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
    }

    public interface IJwtService
    {
        string GenerateToken(User user);
        bool ValidateToken(string token);
    }
}
