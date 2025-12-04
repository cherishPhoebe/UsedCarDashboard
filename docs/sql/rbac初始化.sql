-- UsedCarDashboard RBAC权限系统建表语句
-- 创建系统模块表（菜单管理）
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
    CONSTRAINT [FK_SystemModules_Parent] FOREIGN KEY ([ParentId]) REFERENCES [SystemModules]([Id])
);

-- 创建系统功能表（按钮级权限）
CREATE TABLE [SystemFunctions] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [ModuleId] INT NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    [Code] NVARCHAR(100) NOT NULL,
    [Description] NVARCHAR(200) NULL,
    [ButtonId] NVARCHAR(50) NULL,
    [ApiPath] NVARCHAR(100) NULL,
    [HttpMethod] NVARCHAR(10) NULL,
    [Type] INT NOT NULL DEFAULT 1,
    [SortOrder] INT NOT NULL DEFAULT 0,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [FK_SystemFunctions_Module] FOREIGN KEY ([ModuleId]) REFERENCES [SystemModules]([Id]),
    CONSTRAINT [UK_SystemFunctions_Code] UNIQUE ([Code])
);

-- 创建角色表
CREATE TABLE [Roles] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(50) NOT NULL UNIQUE,
    [Description] NVARCHAR(100) NULL,
    [RoleType] NVARCHAR(20) NOT NULL DEFAULT 'Custom',
    [Level] INT NOT NULL DEFAULT 1,
    [IsSystem] BIT NOT NULL DEFAULT 0,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NULL
);

-- 创建用户角色关联表
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

-- 创建角色功能权限关联表
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

-- 创建角色菜单权限关联表
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

-- 创建索引以提高查询性能
CREATE INDEX [IX_SystemModules_ParentId] ON [SystemModules]([ParentId]);
CREATE INDEX [IX_SystemModules_IsActive] ON [SystemModules]([IsActive]);
CREATE INDEX [IX_SystemFunctions_ModuleId] ON [SystemFunctions]([ModuleId]);
CREATE INDEX [IX_SystemFunctions_Type] ON [SystemFunctions]([Type]);
CREATE INDEX [IX_UserRoles_UserId] ON [UserRoles]([UserId]);
CREATE INDEX [IX_UserRoles_RoleId] ON [UserRoles]([RoleId]);
CREATE INDEX [IX_RoleFunctions_RoleId] ON [RoleFunctions]([RoleId]);
CREATE INDEX [IX_RoleFunctions_FunctionId] ON [RoleFunctions]([FunctionId]);
CREATE INDEX [IX_RoleModules_RoleId] ON [RoleModules]([RoleId]);
CREATE INDEX [IX_RoleModules_ModuleId] ON [RoleModules]([ModuleId]);

-- 插入系统默认数据
-- 1. 插入系统模块
INSERT INTO [SystemModules] ([Name], [Code], [Description], [Icon], [RoutePath], [SortOrder]) VALUES
(N'仪表板', 'dashboard', N'系统主仪表板', 'dashboard', '/dashboard', 1),
(N'用户管理', 'user-management', N'用户信息管理', 'user', '/users', 2),
(N'角色管理', 'role-management', N'角色权限管理', 'team', '/roles', 3),
(N'车辆管理', 'car-management', N'二手车信息管理', 'car', '/cars', 4),
(N'销售管理', 'sale-management', N'销售记录管理', 'shopping', '/sales', 5),
(N'数据统计', 'analytics', N'数据统计分析', 'bar-chart', '/analytics', 6),
(N'系统设置', 'system-settings', N'系统配置管理', 'setting', '/settings', 7);

-- 2. 插入子模块（以用户管理为例）
INSERT INTO [SystemModules] ([Name], [Code], [Description], [Icon], [RoutePath], [ParentId], [SortOrder]) VALUES
(N'用户列表', 'user-list', N'用户信息列表', NULL, '/users/list', 2, 1),
(N'用户详情', 'user-detail', N'用户详细信息', NULL, '/users/detail', 2, 2),
(N'用户权限', 'user-permissions', N'用户权限设置', NULL, '/users/permissions', 2, 3);

-- 3. 插入系统功能（按钮级权限）
INSERT INTO [SystemFunctions] ([ModuleId], [Name], [Code], [Description], [ButtonId], [ApiPath], [HttpMethod], [Type], [SortOrder]) VALUES
-- 用户管理功能
(2, N'新增用户', 'user.create', N'创建新用户', 'btn-user-create', '/api/users', 'POST', 1, 1),
(2, N'编辑用户', 'user.edit', N'编辑用户信息', 'btn-user-edit', '/api/users/{id}', 'PUT', 1, 2),
(2, N'删除用户', 'user.delete', N'删除用户', 'btn-user-delete', '/api/users/{id}', 'DELETE', 1, 3),
(2, N'分配角色', 'user.assign-role', N'为用户分配角色', 'btn-user-assign-role', '/api/users/{id}/roles', 'POST', 1, 4),
(2, N'导出用户', 'user.export', N'导出用户数据', 'btn-user-export', '/api/users/export', 'GET', 1, 5),

-- 角色管理功能
(3, N'新增角色', 'role.create', N'创建新角色', 'btn-role-create', '/api/roles', 'POST', 1, 1),
(3, N'编辑角色', 'role.edit', N'编辑角色信息', 'btn-role-edit', '/api/roles/{id}', 'PUT', 1, 2),
(3, N'删除角色', 'role.delete', N'删除角色', 'btn-role-delete', '/api/roles/{id}', 'DELETE', 1, 3),
(3, N'权限配置', 'role.permissions', N'配置角色权限', 'btn-role-permissions', '/api/roles/{id}/permissions', 'POST', 1, 4),

-- 车辆管理功能
(4, N'新增车辆', 'car.create', N'添加二手车信息', 'btn-car-create', '/api/cars', 'POST', 1, 1),
(4, N'编辑车辆', 'car.edit', N'编辑车辆信息', 'btn-car-edit', '/api/cars/{id}', 'PUT', 1, 2),
(4, N'删除车辆', 'car.delete', N'删除车辆', 'btn-car-delete', '/api/cars/{id}', 'DELETE', 1, 3),
(4, N'车辆上架', 'car.publish', N'发布车辆信息', 'btn-car-publish', '/api/cars/{id}/publish', 'POST', 1, 4),

-- API接口权限
(2, N'查询用户列表', 'user.api.list', N'获取用户列表API', NULL, '/api/users', 'GET', 2, 10),
(2, N'查询用户详情', 'user.api.detail', N'获取用户详情API', NULL, '/api/users/{id}', 'GET', 2, 11),
(3, N'查询角色列表', 'role.api.list', N'获取角色列表API', NULL, '/api/roles', 'GET', 2, 10);

-- 4. 插入系统默认角色
INSERT INTO [Roles] ([Name], [Description], [RoleType], [Level], [IsSystem], [IsActive]) VALUES
(N'超级管理员', N'系统最高权限管理员', 'System', 1, 1, 1),
(N'系统管理员', N'系统管理权限', 'Admin', 2, 1, 1),
(N'销售经理', N'销售部门经理', 'Business', 3, 0, 1),
(N'销售人员', N'普通销售人员', 'Business', 4, 0, 1),
(N'数据查看员', N'只能查看数据', 'Business', 5, 0, 1);

-- 5. 为超级管理员分配所有权限
INSERT INTO [RoleModules] ([RoleId], [ModuleId], [CanAccess], [GrantedBy])
SELECT 1, [Id], 1, 1 FROM [SystemModules] WHERE [IsActive] = 1;

INSERT INTO [RoleFunctions] ([RoleId], [FunctionId], [PermissionLevel], [GrantedBy])
SELECT 1, [Id], 5, 1 FROM [SystemFunctions] WHERE [IsActive] = 1;

-- 创建视图：用户权限视图
CREATE VIEW [UserPermissions] AS
SELECT
    ur.[UserId],
    m.[Code] AS ModuleCode,
    m.[RoutePath],
    f.[Code] AS FunctionCode,
    f.[ButtonId],
    f.[ApiPath],
    f.[HttpMethod],
    rf.[PermissionLevel]
FROM [UserRoles] ur
INNER JOIN [RoleModules] rm ON ur.[RoleId] = rm.[RoleId]
INNER JOIN [SystemModules] m ON rm.[ModuleId] = m.[Id]
INNER JOIN [RoleFunctions] rf ON ur.[RoleId] = rf.[RoleId]
INNER JOIN [SystemFunctions] f ON rf.[FunctionId] = f.[Id]
WHERE ur.[ExpiresAt] IS NULL OR ur.[ExpiresAt] > GETUTCDATE()
AND rm.[CanAccess] = 1
AND m.[IsActive] = 1 AND m.[IsVisible] = 1
AND f.[IsActive] = 1;

PRINT 'RBAC权限系统表结构创建完成！';
