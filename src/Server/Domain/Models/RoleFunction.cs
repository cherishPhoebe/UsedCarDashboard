using SqlSugar;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    // 角色功能权限关联表
    [SugarTable("RoleFunctions")]
    public class RoleFunction : BaseEntity
    {
        [SugarColumn(IsNullable = false)]
        public int RoleId { get; set; }

        [SugarColumn(IsNullable = false)]
        public int FunctionId { get; set; }

        [SugarColumn(IsNullable = false)]
        public PermissionLevel PermissionLevel { get; set; }

        [SugarColumn(IsNullable = false)]
        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;

        [SugarColumn(IsNullable = true)]
        public int? GrantedBy { get; set; }

        [Navigate(NavigateType.OneToOne, nameof(RoleId))]
        public Role Role { get; set; }

        [Navigate(NavigateType.OneToOne, nameof(FunctionId))]
        public SystemFunction Function { get; set; }
    }
}
