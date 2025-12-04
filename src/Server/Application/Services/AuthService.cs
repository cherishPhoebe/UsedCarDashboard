using Domain.Entities;
using Domain.Repositories;
using Domain.Services;
using Microsoft.Extensions.Configuration;
using Shared.Auth;
using Shared.Security;
using System.Security.Cryptography;

namespace Application.Services
{
    public class AuthService: IAuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IPasswordHasher _hasher;
        private readonly JwtHelper _jwt;
        private readonly IConfiguration _config;

        public AuthService(IUserRepository userRepo, IPasswordHasher hasher, JwtHelper jwt, IConfiguration config)
        {
            _userRepo = userRepo;
            _hasher = hasher;
            _jwt = jwt;
            _config = config;
        }

        public async Task<(string accessToken, string refreshToken)> LoginAsync(string userName, string password)
        {
            var user = await _userRepo.GetByUserNameAsync(userName);
            if (user == null) throw new UnauthorizedAccessException("Invalid credentials");
            if (!_hasher.Verify(password, user.Salt ?? "", user.PasswordHash)) throw new UnauthorizedAccessException("Invalid credentials");

            // roles for token claims
            var roles = (await _userRepo.GetUserRolesAsync(user.Id)).Select(r => r.NormalizedName);
            var accessToken = _jwt.CreateAccessToken(user.Id, user.UserName, roles);

            // create refresh token (secure random GUID)
            var refresh = Guid.NewGuid().ToString("N") + Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            var expires = DateTime.UtcNow.AddDays(Convert.ToDouble(_config["Jwt:RefreshTokenExpirationDays"]));
            var rt = new RefreshToken { UserId = user.Id, Token = refresh, ExpiresAt = expires, CreatedAt = DateTime.UtcNow };
            await _userRepo.AddRefreshTokenAsync(rt);

            return (accessToken, refresh);
        }


        public async Task<(string accessToken, string refreshToken)> RefreshAsync(string refreshToken)
        {
            var rt = await _userRepo.FindRefreshTokenAsync(refreshToken);
            if (rt == null || rt.RevokedAt != null || rt.ExpiresAt <= DateTime.UtcNow) throw new UnauthorizedAccessException("Invalid refresh token");
            var user = await _userRepo.GetByIdAsync(rt.UserId);
            if (user == null) throw new UnauthorizedAccessException("User not found");

            var roles = (await _userRepo.GetUserRolesAsync(user.Id)).Select(r => r.NormalizedName);
            var newAccess = _jwt.CreateAccessToken(user.Id, user.UserName, roles);
            var newRefresh = Guid.NewGuid().ToString("N") + Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            var newExpires = DateTime.UtcNow.AddDays(Convert.ToDouble(_config["Jwt:RefreshTokenExpirationDays"]));

            // revoke old, add new
            await _userRepo.RevokeRefreshTokenAsync(rt.Id);
            await _userRepo.AddRefreshTokenAsync(new RefreshToken { UserId = user.Id, Token = newRefresh, ExpiresAt = newExpires, CreatedAt = DateTime.UtcNow });

            return (newAccess, newRefresh);
        }


    }
}