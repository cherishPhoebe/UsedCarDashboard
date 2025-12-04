using Application.Security;
using Domain.Repositories;
using Domain.Services;

namespace Application.Services
{
    public class RoleAppService: IRoleAppService
    {
        private readonly IRoleRepository _roleRepo;
        private readonly IUserRepository _userRepo;
        private readonly IPermissionChecker _permissionChecker;

        public RoleAppService(IRoleRepository roleRepo, IUserRepository userRepo, IPermissionChecker permissionChecker)
        {
            _roleRepo = roleRepo;
            _userRepo = userRepo;
            _permissionChecker = permissionChecker;
        }

        public async Task AssignPermissionToRoleAsync(long roleId, long permissionId)
        {
            await _roleRepo.AssignPermissionAsync(roleId, permissionId);
            // invalidate caches of users that have this role
            var userIds = await _roleRepo.GetUserIdsForRoleAsync(roleId);
            foreach (var uid in userIds)
            {
                await _permissionChecker.InvalidateUserCacheAsync(uid);
            }
        }

        public async Task RemovePermissionFromRoleAsync(long roleId, long permissionId)
        {
            await _roleRepo.RemovePermissionAsync(roleId, permissionId);
            var userIds = await _roleRepo.GetUserIdsForRoleAsync(roleId);
            foreach (var uid in userIds)
            {
                await _permissionChecker.InvalidateUserCacheAsync(uid);
            }
        }
    }
}
