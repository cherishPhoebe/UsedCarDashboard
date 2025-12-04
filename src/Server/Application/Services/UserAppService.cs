using Domain.Dtos.Users;
using Domain.Entities;
using Domain.Repositories;
using Domain.Services;
using Shared.Security;

namespace Application.Services
{
    public class UserAppService : IUserAppService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;

        public UserAppService(IUserRepository userRepository, IPasswordHasher passwordHasher)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<long> CreateAsync(string userName, string password, string? email = null)
        {
            var exists = await _userRepository.GetByUserNameAsync(userName);
            if (exists != null) throw new InvalidOperationException("用户名已存在");
            var salt = _passwordHasher.GenerateSalt();
            var hash = _passwordHasher.HashPassword(password, salt);
            var user = new User
            {
                UserName = userName,
                NormalizedUserName = userName.ToUpperInvariant(),
                Email = email,
                PasswordHash = hash,
                Salt = salt,
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            };
            return await _userRepository.AddAsync(user);
        }

        public async Task<UserDto?> GetByIdAsync(long id)
        {
            var u = await _userRepository.GetByIdAsync(id);
            if (u == null) return null;
            return new UserDto { Id = u.Id, UserName = u.UserName, Email = u.Email, IsEnabled = u.IsEnabled, CreatedAt = u.CreatedAt };
        }

        public async Task<UserDto?> GetByUserNameAsync(string userName)
        {
            var u = await _userRepository.GetByUserNameAsync(userName);
            if (u == null) return null;
            return new UserDto { Id = u.Id, UserName = u.UserName, Email = u.Email, IsEnabled = u.IsEnabled, CreatedAt = u.CreatedAt };
        }

        public async Task UpdatePasswordAsync(long userId, string newPassword)
        {
            var u = await _userRepository.GetByIdAsync(userId);
            if (u == null) throw new InvalidOperationException("用户不存在");
            var salt = _passwordHasher.GenerateSalt();
            u.PasswordHash = _passwordHasher.HashPassword(newPassword, salt);
            u.Salt = salt;
            u.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(u);
        }
    }
}
