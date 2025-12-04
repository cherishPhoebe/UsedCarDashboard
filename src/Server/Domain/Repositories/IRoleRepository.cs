using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Repositories
{
    public interface IRoleRepository
    {
        Task<Role?> GetByIdAsync(long id);
        Task<Role?> GetByNormalizedNameAsync(string normalizedName);
        Task<long> AddAsync(Role role);
        Task UpdateAsync(Role role);
        Task DeleteAsync(long id);
        Task AssignPermissionAsync(long roleId, long permissionId);
        Task RemovePermissionAsync(long roleId, long permissionId);
        Task<IEnumerable<Permission>> GetRolePermissionsAsync(long roleId);
        Task<IEnumerable<long>> GetUserIdsForRoleAsync(long roleId);
    }
}
