using Domain.Entities;
using SqlSugar;

namespace Infrastructure.Data
{
    public class AppDbContext
    {
        public AppDbContext(ISqlSugarClient sqlSugarClient)
        {
            Database = sqlSugarClient;
        }

        public ISqlSugarClient Database { get; }

        public void InitializeDatabase()
        {
            try
            {
                // 创建数据库（如果不存在）
                Database.DbMaintenance.CreateDatabase();

                // 创建表
                Database.CodeFirst.InitTables<User>();

                // 初始化基础数据
                InitializeSeedData();
            }
            catch (Exception ex)
            {
                throw new Exception("数据库初始化失败", ex);
            }
        }

        private void InitializeSeedData()
        {
        }
    }





}
