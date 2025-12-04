-- RBAC权限系统数据库表结构
-- 创建数据库
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'UsedCarDashboard')
BEGIN
    CREATE DATABASE UsedCarDashboard;
END
GO

USE UsedCarDashboard;
GO

-- 用户表
CREATE TABLE [Users] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Username] NVARCHAR(50) NOT NULL UNIQUE,
    [PasswordHash] NVARCHAR(100) NOT NULL,
    [Email] NVARCHAR(100) NOT NULL UNIQUE,
    [Phone] NVARCHAR(20) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [LastLogin] DATETIME2 NULL,
    [UpdatedAt] DATETIME2 NULL
);

-- 角色表
CREATE TABLE [Roles] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(50) NOT NULL UNIQUE,
    [Description] NVARCHAR(200) NULL,
    [RoleType] NVARCHAR(20) NOT NULL DEFAULT 'Custom',
    [Level] INT NOT NULL DEFAULT 1,
    [IsSystem] BIT NOT NULL DEFAULT 0,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NULL
);

-- 用户角色关联表
CREATE TABLE [UserRoles] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [UserId] INT NOT NULL,
    [RoleId] INT NOT NULL,
    [AssignedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [AssignedBy] INT NULL,
    [ExpiresAt] DATETIME2 NULL,
    CONSTRAINT [FK_UserRoles_User] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]),
    CONSTRAINT [FK_UserRoles_Role] FOREIGN KEY ([RoleId]) REFERENCES [Roles]([Id]),
    CONSTRAINT [UK_UserRoles_UserRole] UNIQUE ([UserId], [RoleId])
);

-- 系统模块表（菜单）
CREATE TABLE [SystemModules] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL,
    [Code] NVARCHAR(100) NOT NULL UNIQUE,
    [Description] NVARCHAR(200) NULL,
    [Icon] NVARCHAR(50) NULL,
    [RoutePath] NVARCHAR(200) NULL,
    [ParentId] INT NULL,
    [SortOrder] INT NOT NULL DEFAULT 0,
    [IsVisible] BIT NOT NULL DEFAULT 1,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NULL,
    CONSTRAINT [FK_SystemModules_Parent] FOREIGN KEY ([ParentId]) REFERENCES [SystemModules]([Id])
);

-- 系统功能表（按钮/API权限）
CREATE TABLE [SystemFunctions] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [ModuleId] INT NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    [Code] NVARCHAR(100) NOT NULL UNIQUE,
    [Description] NVARCHAR(200) NULL,
    [ButtonId] NVARCHAR(50) NULL,
    [ApiPath] NVARCHAR(100) NULL,
    [HttpMethod] NVARCHAR(10) NULL,
    [Type] INT NOT NULL DEFAULT 1,
    [SortOrder] INT NOT NULL DEFAULT 0,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NULL,
    CONSTRAINT [FK_SystemFunctions_Module] FOREIGN KEY ([ModuleId]) REFERENCES [SystemModules]([Id])
);

-- 角色模块权限表
CREATE TABLE [RoleModules] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [RoleId] INT NOT NULL,
    [ModuleId] INT NOT NULL,
    [CanAccess] BIT NOT NULL DEFAULT 1,
    [GrantedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [GrantedBy] INT NULL,
    CONSTRAINT [FK_RoleModules_Role] FOREIGN KEY ([RoleId]) REFERENCES [Roles]([Id]),
    CONSTRAINT [FK_RoleModules_Module] FOREIGN KEY ([ModuleId]) REFERENCES [SystemModules]([Id]),
    CONSTRAINT [UK_RoleModules_RoleModule] UNIQUE ([RoleId], [ModuleId])
);

-- 角色功能权限表
CREATE TABLE [RoleFunctions] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [RoleId] INT NOT NULL,
    [FunctionId] INT NOT NULL,
    [PermissionLevel] INT NOT NULL DEFAULT 1,
    [GrantedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [GrantedBy] INT NULL,
    CONSTRAINT [FK_RoleFunctions_Role] FOREIGN KEY ([RoleId]) REFERENCES [Roles]([Id]),
    CONSTRAINT [FK_RoleFunctions_Function] FOREIGN KEY ([FunctionId]) REFERENCES [SystemFunctions]([Id]),
    CONSTRAINT [UK_RoleFunctions_RoleFunction] UNIQUE ([RoleId], [FunctionId])
);

-- 审计日志表
CREATE TABLE [AuditLogs] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [UserId] INT NOT NULL,
    [Action] NVARCHAR(50) NOT NULL,
    [TargetType] NVARCHAR(50) NOT NULL,
    [TargetId] NVARCHAR(100) NOT NULL,
    [Details] NVARCHAR(500) NULL,
    [IpAddress] NVARCHAR(50) NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [FK_AuditLogs_User] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id])
);

-- 创建索引
CREATE INDEX [IX_Users_Username] ON [Users]([Username]);
CREATE INDEX [IX_Users_Email] ON [Users]([Email]);
CREATE INDEX [IX_Users_IsActive] ON [Users]([IsActive]);
CREATE INDEX [IX_Roles_IsActive] ON [Roles]([IsActive]);
CREATE INDEX [IX_UserRoles_UserId] ON [UserRoles]([UserId]);
CREATE INDEX [IX_UserRoles_RoleId] ON [UserRoles]([RoleId]);
CREATE INDEX [IX_SystemModules_ParentId] ON [SystemModules]([ParentId]);
CREATE INDEX [IX_SystemModules_IsActive] ON [SystemModules]([IsActive]);
CREATE INDEX [IX_SystemFunctions_ModuleId] ON [SystemFunctions]([ModuleId]);
CREATE INDEX [IX_SystemFunctions_Type] ON [SystemFunctions]([Type]);
CREATE INDEX [IX_RoleModules_RoleId] ON [RoleModules]([RoleId]);
CREATE INDEX [IX_RoleModules_ModuleId] ON [RoleModules]([ModuleId]);
CREATE INDEX [IX_RoleFunctions_RoleId] ON [RoleFunctions]([RoleId]);
CREATE INDEX [IX_RoleFunctions_FunctionId] ON [RoleFunctions]([FunctionId]);
CREATE INDEX [IX_AuditLogs_UserId] ON [AuditLogs]([UserId]);
CREATE INDEX [IX_AuditLogs_CreatedAt] ON [AuditLogs]([CreatedAt]);

-- 插入默认数据
INSERT INTO [Roles] ([Name], [Description], [RoleType], [Level], [IsSystem]) VALUES
(N'超级管理员', N'系统最高权限管理员', 'System', 1, 1),
(N'系统管理员', N'系统管理权限', 'Admin', 2, 1),
(N'销售经理', N'销售部门经理', 'Business', 3, 0),
(N'销售人员', N'普通销售人员', 'Business', 4, 0),
(N'数据查看员', N'只能查看数据', 'Business', 5, 0);

-- 插入系统模块
INSERT INTO [SystemModules] ([Name], [Code], [Description], [Icon], [RoutePath], [SortOrder]) VALUES
(N'仪表板', 'dashboard', N'系统主仪表板', 'dashboard', '/dashboard', 1),
(N'用户管理', 'user-management', N'用户信息管理', 'user', '/users', 2),
(N'角色管理', 'role-management', N'角色权限管理', 'team', '/roles', 3),
(N'权限管理', 'permission-management', N'权限配置管理', 'safety', '/permissions', 4),
(N'车辆管理', 'car-management', N'二手车信息管理', 'car', '/cars', 5),
(N'销售管理', 'sale-management', N'销售记录管理', 'shopping', '/sales', 6),
(N'数据统计', 'analytics', N'数据统计分析', 'bar-chart', '/analytics', 7),
(N'系统设置', 'system-settings', N'系统配置管理', 'setting', '/settings', 8);

-- 插入子模块
INSERT INTO [SystemModules] ([Name], [Code], [Description], [RoutePath], [ParentId], [SortOrder]) VALUES
(N'用户列表', 'user-list', N'用户信息列表', '/users/list', 2, 1),
(N'角色列表', 'role-list', N'角色信息列表', '/roles/list', 3, 1),
(N'权限配置', 'permission-config', N'权限配置页面', '/permissions/config', 4, 1);

-- 插入系统功能
INSERT INTO [SystemFunctions] ([ModuleId], [Name], [Code], [Description], [ButtonId], [ApiPath], [HttpMethod], [Type]) VALUES
(2, N'新增用户', 'user.create', N'创建新用户', 'btn-user-create', '/api/users', 'POST', 1),
(2, N'编辑用户', 'user.edit', N'编辑用户信息', 'btn-user-edit', '/api/users/{id}', 'PUT', 1),
(2, N'删除用户', 'user.delete', N'删除用户', 'btn-user-delete', '/api/users/{id}', 'DELETE', 1),
(3, N'新增角色', 'role.create', N'创建新角色', 'btn-role-create', '/api/roles', 'POST', 1),
(3, N'编辑角色', 'role.edit', N'编辑角色信息', 'btn-role-edit', '/api/roles/{id}', 'PUT', 1);

-- 为超级管理员分配所有权限
INSERT INTO [RoleModules] ([RoleId], [ModuleId], [GrantedBy])
SELECT 1, [Id], 1 FROM [SystemModules];

INSERT INTO [RoleFunctions] ([RoleId], [FunctionId], [PermissionLevel], [GrantedBy])
SELECT 1, [Id], 4, 1 FROM [SystemFunctions];

PRINT 'RBAC权限系统数据库表结构创建完成！';
