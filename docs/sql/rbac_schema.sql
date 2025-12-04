-- 创建数据库（如果需要）
-- CREATE DATABASE RbacDb;
-- USE RbacDb;

CREATE TABLE dbo.Users(
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserName NVARCHAR(128) NOT NULL UNIQUE,
    NormalizedUserName NVARCHAR(128) NOT NULL,
    Email NVARCHAR(256) NULL,
    PasswordHash NVARCHAR(512) NOT NULL,
    Salt NVARCHAR(128) NULL,
    IsLocked BIT NOT NULL DEFAULT 0,
    IsEnabled BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    LastLoginAt DATETIME2 NULL
);
CREATE INDEX IX_Users_NormalizedUserName ON dbo.Users(NormalizedUserName);

CREATE TABLE dbo.Roles(
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(128) NOT NULL UNIQUE,
    NormalizedName NVARCHAR(128) NOT NULL,
    Description NVARCHAR(512) NULL,
    IsStatic BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL
);
CREATE INDEX IX_Roles_NormalizedName ON dbo.Roles(NormalizedName);

CREATE TABLE dbo.UserRoles(
    UserId BIGINT NOT NULL,
    RoleId BIGINT NOT NULL,
    AssignedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_UserRoles PRIMARY KEY (UserId, RoleId),
    CONSTRAINT FK_UserRoles_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoles_Role FOREIGN KEY (RoleId) REFERENCES dbo.Roles(Id) ON DELETE CASCADE
);
CREATE INDEX IX_UserRoles_RoleId ON dbo.UserRoles(RoleId);

CREATE TABLE dbo.Menus(
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(128) NOT NULL,
    Title NVARCHAR(256) NOT NULL,
    ParentId BIGINT NULL,
    Path NVARCHAR(512) NULL,
    Component NVARCHAR(256) NULL,
    Icon NVARCHAR(128) NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsVisible BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Menus_Code ON dbo.Menus(Code);
CREATE INDEX IX_Menus_ParentId ON dbo.Menus(ParentId);

CREATE TABLE dbo.MenuButtons(
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    MenuId BIGINT NOT NULL,
    Code NVARCHAR(128) NOT NULL,
    Label NVARCHAR(128) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_MenuButtons_Menu FOREIGN KEY (MenuId) REFERENCES dbo.Menus(Id) ON DELETE CASCADE
);
CREATE INDEX IX_MenuButtons_MenuId ON dbo.MenuButtons(MenuId);
CREATE INDEX IX_MenuButtons_Code ON dbo.MenuButtons(Code);

CREATE TABLE dbo.Permissions(
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(256) NOT NULL,
    DisplayName NVARCHAR(256) NULL,
    ResourceType TINYINT NOT NULL,
    ResourceKey NVARCHAR(256) NULL,
    Action NVARCHAR(64) NULL,
    Category NVARCHAR(128) NULL,
    IsEnabled BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Permissions_Name UNIQUE (Name)
);
CREATE INDEX IX_Permissions_Resource ON dbo.Permissions(ResourceType, ResourceKey, Action);

CREATE TABLE dbo.RolePermissions(
    RoleId BIGINT NOT NULL,
    PermissionId BIGINT NOT NULL,
    AssignedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_RolePermissions PRIMARY KEY (RoleId, PermissionId),
    CONSTRAINT FK_RolePermissions_Role FOREIGN KEY (RoleId) REFERENCES dbo.Roles(Id) ON DELETE CASCADE,
    CONSTRAINT FK_RolePermissions_Permission FOREIGN KEY (PermissionId) REFERENCES dbo.Permissions(Id) ON DELETE CASCADE
);
CREATE INDEX IX_RolePermissions_PermissionId ON dbo.RolePermissions(PermissionId);

CREATE TABLE dbo.UserPermissions(
    UserId BIGINT NOT NULL,
    PermissionId BIGINT NOT NULL,
    Type TINYINT NOT NULL DEFAULT 1,
    AssignedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_UserPermissions PRIMARY KEY (UserId, PermissionId),
    CONSTRAINT FK_UserPermissions_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserPermissions_Permission FOREIGN KEY (PermissionId) REFERENCES dbo.Permissions(Id) ON DELETE CASCADE
);
CREATE INDEX IX_UserPermissions_PermissionId ON dbo.UserPermissions(PermissionId);

CREATE TABLE dbo.RefreshTokens(
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL,
    Token NVARCHAR(512) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RevokedAt DATETIME2 NULL,
    CONSTRAINT FK_RefreshTokens_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
);
CREATE INDEX IX_RefreshTokens_UserId ON dbo.RefreshTokens(UserId);

CREATE TABLE dbo.AuditLogs(
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NULL,
    Action NVARCHAR(256) NOT NULL,
    Entity NVARCHAR(128) NULL,
    EntityId NVARCHAR(128) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Details NVARCHAR(MAX) NULL
);
CREATE INDEX IX_AuditLogs_UserId ON dbo.AuditLogs(UserId);
