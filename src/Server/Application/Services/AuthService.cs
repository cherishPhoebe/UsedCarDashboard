using Domain.Interfaces.Repositories;
using Domain.Interfaces.Services;
using Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly Random _random = new();

        public AuthService(IUserRepository userRepository, IJwtService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        public string GenerateVerificationCode()
        {
            return _random.Next(1000, 9999).ToString();
        }

        public string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        public bool VerifyPassword(string password, string passwordHash)
        {
            var hashedInput = HashPassword(password);
            return passwordHash == hashedInput;
        }

        public string GenerateJwtToken(User user)
        {
            return _jwtService.GenerateToken(user);
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.VerificationCode) || request.VerificationCode.Length != 4)
            {
                return new AuthResponse { Success = false, Message = "验证码必须是4位数字" };
            }

            var user = await _userRepository.GetUserByUsernameAsync(request.Username);
            if (user == null)
            {
                return new AuthResponse { Success = false, Message = "用户名或密码错误" };
            }

            if (!VerifyPassword(request.Password, user.PasswordHash))
            {
                return new AuthResponse { Success = false, Message = "用户名或密码错误" };
            }

            user.LastLogin = DateTime.UtcNow;
            await _userRepository.UpdateUserAsync(user);

            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Success = true,
                Message = "登录成功",
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    CreatedAt = user.CreatedAt,
                    LastLogin = user.LastLogin
                }
            };
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            if (await _userRepository.UserExistsAsync(request.Username))
            {
                return new AuthResponse { Success = false, Message = "用户名已存在" };
            }

            if (await _userRepository.GetUserByEmailAsync(request.Email) != null)
            {
                return new AuthResponse { Success = false, Message = "邮箱已被注册" };
            }

            var user = new User
            {
                Username = request.Username,
                PasswordHash = HashPassword(request.Password),
                Email = request.Email,
                CreatedAt = DateTime.UtcNow,
                LastLogin = DateTime.UtcNow
            };

            await _userRepository.CreateUserAsync(user);

            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Success = true,
                Message = "注册成功",
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    CreatedAt = user.CreatedAt,
                    LastLogin = user.LastLogin
                }
            };
        }
    }
}
