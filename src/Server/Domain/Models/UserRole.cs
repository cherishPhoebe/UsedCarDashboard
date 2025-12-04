using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    // 增强的用户角色关联表
    [SugarTable("UserRoles")]
    public class UserRole : BaseEntity
    {
        [SugarColumn(IsNullable = false)]
        public int UserId { get; set; }

        [SugarColumn(IsNullable = false)]
        public int RoleId { get; set; }

        [SugarColumn(IsNullable = false)]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        [SugarColumn(IsNullable = true)]
        public int? AssignedBy { get; set; }

        [SugarColumn(IsNullable = true)]
        public DateTime? ExpiresAt { get; set; }

        [Navigate(NavigateType.OneToOne, nameof(UserId))]
        public User User { get; set; }

        [Navigate(NavigateType.OneToOne, nameof(RoleId))]
        public Role Role { get; set; }
    }
}
