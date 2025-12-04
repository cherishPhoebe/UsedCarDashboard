using SqlSugar;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    // 角色菜单权限关联表
    [SugarTable("RoleModules")]
    public class RoleModule : BaseEntity
    {
        [SugarColumn(IsNullable = false)]
        public int RoleId { get; set; }

        [SugarColumn(IsNullable = false)]
        public int ModuleId { get; set; }

        [SugarColumn(IsNullable = false)]
        public bool CanAccess { get; set; } = true;

        [SugarColumn(IsNullable = false)]
        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;

        [SugarColumn(IsNullable = true)]
        public int? GrantedBy { get; set; }

        [Navigate(NavigateType.OneToOne, nameof(RoleId))]
        public Role Role { get; set; }

        [Navigate(NavigateType.OneToOne, nameof(ModuleId))]
        public SystemModule Module { get; set; }
    }
}
