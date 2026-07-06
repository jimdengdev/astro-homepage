---
name: blog-deploy
description: 一键部署博客到 GitHub，触发自动构建部署。提供博客标题即可完成 git add、commit、push 全流程。使用场景：部署博客、发布文章、推送上线、deploy blog、publish post。
---

# Blog Deploy Skill

一键将博客变更推送到 GitHub，触发自动构建部署。

## 快速使用

当用户说"部署博客"、"发布文章"、"推送上线"、"deploy"、"publish"等时，执行部署脚本。

### 方式一：使用部署脚本（推荐）

```bash
./scripts/deploy-blog.sh "博客标题"
```

脚本会自动完成：
1. `git add .` — 暂存所有变更
2. `git commit -m "feat: 博客标题"` — 提交（feat: 前缀）
3. `git push origin main` — 推送到 main 分支

推送成功后，GitHub Actions 或 Vercel/Cloudflare Pages 等 CI/CD 会自动触发构建部署。

### 方式二：手动执行

如果用户有特殊需求（如修改提交信息格式），可以逐步手动执行：

```bash
git add .
git commit -m "feat: 博客标题"
git push origin main
```

## 执行前检查

1. **确认有变更**：脚本会自动检测，无变更时跳过推送
2. **确认分支**：默认推送到 `origin main`，如果使用其他分支需要修改脚本
3. **确认远程仓库**：确保 `git remote -v` 正确配置

## 你的任务

当用户请求部署博客时：

1. **获取博客标题**：如果用户未提供，从最近创建的博文中提取标题，或询问用户
2. **执行脚本**：运行 `./scripts/deploy-blog.sh "标题"`
3. **确认结果**：告知用户推送结果

## 示例对话

**用户**：部署博客
**助手**：执行 `./scripts/deploy-blog.sh "Docker Compose 部署 New-API + Sub2API + CPA"`，完成后告知推送成功。

**用户**：把文章推送上线，标题是"React Hooks 最佳实践"
**助手**：执行 `./scripts/deploy-blog.sh "React Hooks 最佳实践"`。
