using Domain.Entities;
using Domain.Repositories;
using Shared.Enums;
using SqlSugar;

namespace Infrastructure.Repositories
{
    public class PermissionRepository : IPermissionRepository
    {
        private readonly ISqlSugarClient _db;
        public PermissionRepository(ISqlSugarClient db) => _db = db;

        public async Task<long> AddAsync(Permission p) => await _db.Insertable(p).ExecuteReturnBigIdentityAsync();
        public async Task DeleteAsync(long id) => await _db.Deleteable<Permission>().In(id).ExecuteCommandAsync();
        public async Task<Permission?> GetByIdAsync(long id) => await _db.Queryable<Permission>().InSingleAsync(id);
        public async Task<Permission?> GetByNameAsync(string name) => await _db.Queryable<Permission>().Where(p => p.Name == name).FirstAsync();
        public async Task UpdateAsync(Permission p) => await _db.Updateable(p).ExecuteCommandAsync();

        public async Task<Permission?> GetByResourceAsync(ResourceType resourceType, string resourceKey, string? action)
        {
            // Try exact match action, otherwise try action is null
            var q = _db.Queryable<Permission>().Where(p => p.ResourceType == resourceType && p.ResourceKey == resourceKey);
            if (!string.IsNullOrEmpty(action))
            {
                var exact = await q.Where(p => p.Action == action).FirstAsync();
                if (exact != null) return exact;
            }
            return await q.Where(p => p.Action == null).FirstAsync();
        }

        public async Task<IEnumerable<Permission>> GetAllByResourceAsync(ResourceType resourceType, string resourceKey)
        {
            return await _db.Queryable<Permission>().Where(p => p.ResourceType == resourceType && p.ResourceKey == resourceKey).ToListAsync();
        }
    }
}
