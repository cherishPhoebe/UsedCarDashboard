using Domain.Dtos.Users;

namespace Domain.Services
{
    public interface IUserAppService
    {
        Task<UserDto?> GetByIdAsync(long id);
        Task<UserDto?> GetByUserNameAsync(string userName);
        Task<long> CreateAsync(string userName, string password, string? email = null);
        Task UpdatePasswordAsync(long userId, string newPassword);
    }
}