using SqlSugar;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    // 增强的角色实体
    [SugarTable("Roles")]
    public class Role : BaseEntity
    {
        [SugarColumn(Length = 50, IsNullable = false)]
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [SugarColumn(Length = 100, IsNullable = true)]
        public string? Description { get; set; }

        [SugarColumn(Length = 20, IsNullable = false)]
        [Required]
        [MaxLength(20)]
        public string RoleType { get; set; } = "Custom";

        [SugarColumn(IsNullable = false)]
        public int Level { get; set; } = 1;

        [SugarColumn(IsNullable = false)]
        public bool IsSystem { get; set; } = false;

        [SugarColumn(IsNullable = false)]
        public bool IsActive { get; set; } = true;

        [SugarColumn(IsNullable = false)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [SugarColumn(IsNullable = true)]
        public DateTime? UpdatedAt { get; set; }

        [Navigate(NavigateType.OneToMany, nameof(UserRole.RoleId))]
        public List<UserRole> UserRoles { get; set; } = new List<UserRole>();

        [Navigate(NavigateType.OneToMany, nameof(RoleFunction.RoleId))]
        public List<RoleFunction> RoleFunctions { get; set; } = new List<RoleFunction>();

        [Navigate(NavigateType.OneToMany, nameof(RoleModule.RoleId))]
        public List<RoleModule> RoleModules { get; set; } = new List<RoleModule>();
    }

}
