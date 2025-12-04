using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.Enums
{
    // 权限级别枚举
    public enum PermissionLevel
    {
        Read = 1,          // 读取权限
        Write = 2,         // 写入权限
        Delete = 3,        // 删除权限
        Execute = 4,       // 执行权限
        Manage = 5         // 管理权限
    }
}
