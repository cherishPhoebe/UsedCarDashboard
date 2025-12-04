using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.SqlSugar
{
    public static class SqlSugarFactory
    {
        public static SqlSugarClient Create(string conn)
        {
            var db = new SqlSugarClient(new ConnectionConfig
            {
                ConnectionString = conn,
                DbType = DbType.SqlServer,
                IsAutoCloseConnection = true,
                InitKeyType = InitKeyType.Attribute
            });

            db.Aop.OnLogExecuting = (sql, pars) => {
                // 可注入 ILogger 输出日志
            };
            return db;
        }
    }
}