using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Services
{
    public interface IRoleAppService
    {
        Task AssignPermissionToRoleAsync(long roleId, long permissionId);
        Task RemovePermissionFromRoleAsync(long roleId, long permissionId);
    }
}
