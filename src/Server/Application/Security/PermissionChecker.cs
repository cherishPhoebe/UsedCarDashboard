using Domain.Repositories;
using Shared.Enums;
using SqlSugar;


namespace Application.Security
{
    public class PermissionChecker : IPermissionChecker
    {
        private readonly IUserRepository _userRepo;
        private readonly IRoleRepository _roleRepo;
        private readonly IPermissionRepository _permRepo;
        private readonly Shared.Redis.ICacheService _cache;

        public PermissionChecker(IUserRepository userRepo, IRoleRepository roleRepo, IPermissionRepository permRepo, Shared.Redis.ICacheService cache)
        {
            _userRepo = userRepo;
            _roleRepo = roleRepo;
            _permRepo = permRepo;
            _cache = cache;
        }

        private string UserPermissionsCacheKey(long userId) => $"user_permissions:{userId}";

        // 将用户权限（merged）缓存为 permissionId 列表
        public async Task<bool> IsGrantedAsync(long userId, ResourceType resourceType, string resourceKey, string? action)
        {
            var perm = await _permRepo.GetByResourceAsync(resourceType, resourceKey, action);
            if (perm == null) return false;
            var pid = perm.Id;

            // 1. 先尝试从缓存取用户 merged permission ids
            var cacheKey = UserPermissionsCacheKey(userId);
            var cached = await _cache.GetAsync<List<long>>(cacheKey);
            if (cached != null)
            {
                return cached.Contains(pid);
            }

            // 2. 缓存不存在 -> 从 DB 拉取并合并（用户单独权限覆盖角色）
            var userPermTuples = await _userRepo.GetUserPermissionsAsync(userId); // (Permission, type)
            var userGrantIds = userPermTuples.Where(t => t.type == 1).Select(t => t.permission.Id).ToHashSet();
            var userDenyIds = userPermTuples.Where(t => t.type == 0).Select(t => t.permission.Id).ToHashSet();

            var roles = await _userRepo.GetUserRolesAsync(userId);
            var rolePermissionIds = new HashSet<long>();
            foreach (var r in roles)
            {
                var rps = await _roleRepo.GetRolePermissionsAsync(r.Id);
                foreach (var p in rps) rolePermissionIds.Add(p.Id);
            }

            // 合并逻辑：先 role 权限 + user explicit grant，然后移除 user explicit deny
            var merged = rolePermissionIds.Union(userGrantIds).Except(userDenyIds).ToList();

            // 3. 存缓存（例如 5 分钟）
            await _cache.SetAsync(cacheKey, merged, TimeSpan.FromMinutes(5));

            return merged.Contains(pid);
        }

        // 当角色/权限/用户权限发生变更时，调用这个方法删除缓存
        public async Task InvalidateUserCacheAsync(long userId)
        {
            await _cache.RemoveAsync(UserPermissionsCacheKey(userId));
        }
    }


    public interface IPermissionChecker
    {
        Task<bool> IsGrantedAsync(long userId, ResourceType resourceType, string resourceKey, string? action);
        Task InvalidateUserCacheAsync(long userId);
    }
}