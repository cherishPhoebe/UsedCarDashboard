using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(long id);
        Task<User?> GetByUserNameAsync(string userName);
        Task<long> AddAsync(User user);
        Task UpdateAsync(User user);
        Task AssignRoleAsync(long userId, long roleId);
        Task RemoveRoleAsync(long userId, long roleId);
        Task<IEnumerable<Role>> GetUserRolesAsync(long userId);
        Task AssignPermissionAsync(long userId, long permissionId, byte type);
        Task RemovePermissionAsync(long userId, long permissionId);
        Task<IEnumerable<(Permission permission, byte type)>> GetUserPermissionsAsync(long userId);
        Task AddRefreshTokenAsync(RefreshToken token);
        Task<RefreshToken?> FindRefreshTokenAsync(string token);
        Task RevokeRefreshTokenAsync(long id);
        Task<IEnumerable<long>> GetUserIdsByRoleIdAsync(long roleId);
    }
}