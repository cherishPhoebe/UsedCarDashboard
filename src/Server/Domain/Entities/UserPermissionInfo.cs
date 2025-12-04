using Shared.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    // 用户权限信息
    public class UserPermissionInfo
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new List<string>();
        public List<string> AccessibleModules { get; set; } = new List<string>();
        public List<string> GrantedFunctions { get; set; } = new List<string>();
        public Dictionary<string, PermissionLevel> FunctionPermissions { get; set; } = new Dictionary<string, PermissionLevel>();
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }
}
