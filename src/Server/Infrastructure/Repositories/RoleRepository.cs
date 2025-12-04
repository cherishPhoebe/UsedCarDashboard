using Domain.Entities;
using Domain.Repositories;
using SqlSugar;

namespace Infrastructure.Repositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly ISqlSugarClient _db;
        public RoleRepository(ISqlSugarClient db) => _db = db;

        public async Task<long> AddAsync(Role role) => await _db.Insertable(role).ExecuteReturnBigIdentityAsync();
        public async Task DeleteAsync(long id) => await _db.Deleteable<Role>().In(id).ExecuteCommandAsync();
        public async Task<Role?> GetByIdAsync(long id) => await _db.Queryable<Role>().InSingleAsync(id);
        public async Task<Role?> GetByNormalizedNameAsync(string normalizedName) => await _db.Queryable<Role>().Where(r => r.NormalizedName == normalizedName).FirstAsync();
        public async Task UpdateAsync(Role role) => await _db.Updateable(role).ExecuteCommandAsync();

        public async Task AssignPermissionAsync(long roleId, long permissionId)
        {
            var exists = await _db.Queryable<RolePermissions>().AnyAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);
            if (!exists)
                await _db.Insertable(new RolePermissions { RoleId = roleId, PermissionId = permissionId, AssignedAt = DateTime.UtcNow }).ExecuteCommandAsync();
        }

        public async Task RemovePermissionAsync(long roleId, long permissionId)
        {
            await _db.Deleteable<RolePermissions>().Where(rp => rp.RoleId == roleId && rp.PermissionId == permissionId).ExecuteCommandAsync();
        }

        public async Task<IEnumerable<Permission>> GetRolePermissionsAsync(long roleId)
        {
            var list = await _db.Queryable<Permission, RolePermissions>((p, rp) => new JoinQueryInfos(JoinType.Inner, p.Id == rp.PermissionId))
                .Where((p, rp) => rp.RoleId == roleId)
                .Select<Permission>("p.*")
                .ToListAsync();
            return list;
        }

        public async Task<IEnumerable<long>> GetUserIdsForRoleAsync(long roleId)
        {
            var rows = await _db.Queryable<UserRoles>().Where(ur => ur.RoleId == roleId).Select<long>("UserId").ToListAsync();
            return rows;
        }
    }
}
