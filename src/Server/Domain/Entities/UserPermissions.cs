using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class UserPermissions
    {
        public long UserId { get; set; }
        public long PermissionId { get; set; }
        public byte Type { get; set; } // 1 grant, 0 deny
        public DateTime AssignedAt { get; set; }
    }
}
