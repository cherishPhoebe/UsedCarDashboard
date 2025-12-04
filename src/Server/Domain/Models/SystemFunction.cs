using SqlSugar;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    // 系统功能表 - 用于按钮级权限控制
    [SugarTable("SystemFunctions")]
    public class SystemFunction : BaseEntity
    {
        [SugarColumn(IsNullable = false)]
        public int ModuleId { get; set; }

        [SugarColumn(Length = 100, IsNullable = false)]
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [SugarColumn(Length = 100, IsNullable = false)]
        [Required]
        [MaxLength(100)]
        public string Code { get; set; } = string.Empty;

        [SugarColumn(Length = 200, IsNullable = true)]
        public string? Description { get; set; }

        [SugarColumn(Length = 50, IsNullable = true)]
        public string? ButtonId { get; set; }

        [SugarColumn(Length = 100, IsNullable = true)]
        public string? ApiPath { get; set; }

        [SugarColumn(Length = 10, IsNullable = true)]
        public string? HttpMethod { get; set; }

        [SugarColumn(IsNullable = false)]
        public FunctionType Type { get; set; }

        [SugarColumn(IsNullable = false)]
        public int SortOrder { get; set; }

        [SugarColumn(IsNullable = false)]
        public bool IsActive { get; set; } = true;

        [SugarColumn(IsNullable = false)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Navigate(NavigateType.OneToOne, nameof(ModuleId))]
        public SystemModule Module { get; set; }

        [Navigate(NavigateType.OneToMany, nameof(RoleFunction.RoleId))]
        public List<RoleFunction> RoleFunctions { get; set; } = new List<RoleFunction>();
    }
}
