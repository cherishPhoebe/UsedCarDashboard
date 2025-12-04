using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class UserRoles
    {
        public long UserId { get; set; }
        public long RoleId { get; set; }
        public DateTime AssignedAt { get; set; }
    }
}
