# Dify 团队迁移（CMD 一键版）

本文只讲你要执行什么命令。你在 Windows `cmd` 里直接复制粘贴即可。

## 0. 前提

1. 你已经安装 Docker Desktop（并启动）。
2. 你在私有仓库里协作（不要公开）。
3. 你当前项目根目录是 `d:\00python_project\KeHai\dify`。

## 1. 你这台机器：导出完整包

在 `cmd` 执行：

```bat
cd /d d:\00python_project\KeHai\dify
powershell -ExecutionPolicy Bypass -File .\scripts\team-portable\export-bundle.ps1 -BundleName team-main -IncludeVectorData
```

执行完成后，会生成目录：

`team-portable-artifacts\team-main`

这个目录里包含：

- `db\dify.dump`：用户、智能体、知识库元数据、模型配置等数据库数据
- `storage\app-storage.tar.gz`：私钥和文件存储（保证密钥可解密）
- `storage\qdrant.tar.gz`：向量库（如果带了 `-IncludeVectorData`）
- `env\.env.runtime`：当时运行环境快照

## 2. 你要提交/分享什么

你至少要分享：

1. 脚本和文档（仓库代码）
2. `team-portable-artifacts\team-main` 这个导出目录

建议放私有 Git LFS 或私有网盘。

## 3. 同学机器：恢复完整环境

同学在 `cmd` 执行：

```bat
cd /d d:\00python_project\KeHai\dify
powershell -ExecutionPolicy Bypass -File .\scripts\team-portable\restore-bundle.ps1 -BundlePath .\team-portable-artifacts\team-main -ApplyRuntimeEnv
```

恢复脚本会自动：

1. 停掉旧容器
2. 还原 storage
3. 还原向量库（如果包里有）
4. 还原 PostgreSQL
5. 重启 Dify 全部服务

## 4. 恢复后验证（同学必做）

1. 打开 Dify 控制台。
2. 检查是否能看到你的工作区、账号、智能体。
3. 打开知识库看文档是否都在。
4. 运行一次工作流/聊天，确认模型调用成功。

## 5. 常见问题（只看结论）

### 5.1 模型 Key 失效/调用报错

一般是没还原 `app-storage.tar.gz` 里的私钥，或者没用 `-ApplyRuntimeEnv`。

重新执行恢复命令：

```bat
cd /d d:\00python_project\KeHai\dify
powershell -ExecutionPolicy Bypass -File .\scripts\team-portable\restore-bundle.ps1 -BundlePath .\team-portable-artifacts\team-main -ApplyRuntimeEnv
```

### 5.2 知识库召回差/查不到

说明向量数据没恢复。确认包里有 `storage\qdrant.tar.gz`，然后重跑恢复。

### 5.3 只想恢复 DB 和 storage，不恢复向量库

```bat
cd /d d:\00python_project\KeHai\dify
powershell -ExecutionPolicy Bypass -File .\scripts\team-portable\restore-bundle.ps1 -BundlePath .\team-portable-artifacts\team-main -ApplyRuntimeEnv -SkipVectorRestore
```

## 6. 安全要求（必须）

1. 这个导出包包含密钥和私钥，只能放私有仓库/私有存储。
2. 严禁发到公开 GitHub。
3. 发生泄露就立刻轮换模型 API keys。
