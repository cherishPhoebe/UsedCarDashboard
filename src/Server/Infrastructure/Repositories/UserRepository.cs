using Domain.Entities;
using Domain.Repositories;
using Shared.Enums;
using SqlSugar;

namespace Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ISqlSugarClient _db;
        public UserRepository(ISqlSugarClient db) => _db = db;

        public async Task<long> AddAsync(User user) => await _db.Insertable(user).ExecuteReturnBigIdentityAsync();
        public async Task<User?> GetByIdAsync(long id) => await _db.Queryable<User>().InSingleAsync(id);
        public async Task<User?> GetByUserNameAsync(string userName) => await _db.Queryable<User>().Where(u => u.UserName == userName).FirstAsync();
        public async Task UpdateAsync(User user) => await _db.Updateable(user).ExecuteCommandAsync();

        public async Task AssignRoleAsync(long userId, long roleId)
        {
            var exists = await _db.Queryable<UserRoles>().AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId);
            if (!exists)
                await _db.Insertable(new UserRoles { UserId = userId, RoleId = roleId, AssignedAt = DateTime.UtcNow }).ExecuteCommandAsync();
        }

        public async Task RemoveRoleAsync(long userId, long roleId)
        {
            await _db.Deleteable<UserRoles>().Where(ur => ur.UserId == userId && ur.RoleId == roleId).ExecuteCommandAsync();
        }

        public async Task<IEnumerable<Role>> GetUserRolesAsync(long userId)
        {
            var list = await _db.Queryable<Role, UserRoles>((r, ur) => new JoinQueryInfos(JoinType.Inner, r.Id == ur.RoleId))
                .Where((r, ur) => ur.UserId == userId)
                .Select<Role>("r.*")
                .ToListAsync();
            return list;
        }

        public async Task AssignPermissionAsync(long userId, long permissionId, byte type)
        {
            var exists = await _db.Queryable<UserPermissions>().AnyAsync(up => up.UserId == userId && up.PermissionId == permissionId);
            if (exists)
            {
                await _db.Updateable<UserPermissions>().SetColumns(up => new UserPermissions { Type = type, AssignedAt = DateTime.UtcNow })
                    .Where(up => up.UserId == userId && up.PermissionId == permissionId)
                    .ExecuteCommandAsync();
            }
            else
            {
                await _db.Insertable(new UserPermissions { UserId = userId, PermissionId = permissionId, Type = type, AssignedAt = DateTime.UtcNow })
                    .ExecuteCommandAsync();
            }
        }

        public async Task RemovePermissionAsync(long userId, long permissionId)
        {
            await _db.Deleteable<UserPermissions>().Where(up => up.UserId == userId && up.PermissionId == permissionId).ExecuteCommandAsync();
        }

        public async Task<IEnumerable<(Permission permission, byte type)>> GetUserPermissionsAsync(long userId)
        {
            var rows = await _db.Ado.SqlQueryAsync<dynamic>($"SELECT p.*, up.Type FROM Permissions p INNER JOIN UserPermissions up ON p.Id=up.PermissionId WHERE up.UserId={userId}");
            var result = new List<(Permission permission, byte type)>();
            foreach (var r in rows)
            {
                var perm = new Permission
                {
                    Id = (long)r.Id,
                    Name = (string)r.Name,
                    DisplayName = r.DisplayName,
                    ResourceType = (ResourceType)(byte)r.ResourceType,
                    ResourceKey = r.ResourceKey,
                    Action = r.Action,
                    Category = r.Category,
                    IsEnabled = (bool)r.IsEnabled,
                    CreatedAt = (DateTime)r.CreatedAt
                };
                byte t = (byte)r.Type;
                result.Add((perm, t));
            }
            return result;
        }

        public async Task AddRefreshTokenAsync(RefreshToken token)
        {
            await _db.Insertable(token).ExecuteCommandAsync();
        }

        public async Task<RefreshToken?> FindRefreshTokenAsync(string token)
        {
            return await _db.Queryable<RefreshToken>().Where(r => r.Token == token).FirstAsync();
        }

        public async Task RevokeRefreshTokenAsync(long id)
        {
            await _db.Updateable<RefreshToken>().SetColumns(r => new RefreshToken { RevokedAt = DateTime.UtcNow }).Where(r => r.Id == id).ExecuteCommandAsync();
        }

        public async Task<IEnumerable<long>> GetUserIdsByRoleIdAsync(long roleId)
        {
            var rows = await _db.Queryable<UserRoles>().Where(ur => ur.RoleId == roleId).Select<long>("UserId").ToListAsync();
            return rows;
        }
    }
}
