using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class RolePermissions
    {
        public long RoleId { get; set; }
        public long PermissionId { get; set; }
        public DateTime AssignedAt { get; set; }
    }
}
