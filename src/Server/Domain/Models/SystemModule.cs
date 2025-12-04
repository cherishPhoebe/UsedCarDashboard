using SqlSugar;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    // 系统模块表 - 用于菜单管理
    [SugarTable("SystemModules")]
    public class SystemModule : BaseEntity
    {
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
        public string? Icon { get; set; }

        [SugarColumn(Length = 200, IsNullable = true)]
        public string? RoutePath { get; set; }

        [SugarColumn(IsNullable = true)]
        public int? ParentId { get; set; }

        [SugarColumn(IsNullable = false)]
        public int SortOrder { get; set; }

        [SugarColumn(IsNullable = false)]
        public bool IsVisible { get; set; } = true;

        [SugarColumn(IsNullable = false)]
        public bool IsActive { get; set; } = true;

        [SugarColumn(IsNullable = false)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Navigate(NavigateType.OneToMany, nameof(ParentId))]
        public List<SystemModule> Children { get; set; } = new List<SystemModule>();

        [Navigate(NavigateType.OneToMany, nameof(SystemFunction.ModuleId))]
        public List<SystemFunction> Functions { get; set; } = new List<SystemFunction>();
    }
}
