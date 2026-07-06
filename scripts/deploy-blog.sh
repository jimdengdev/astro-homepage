#!/bin/bash
# =============================================================================
# deploy-blog.sh — 一键部署博客到 GitHub，触发自动部署
# =============================================================================
# 用法:
#   ./scripts/deploy-blog.sh "博客标题"
#   ./scripts/deploy-blog.sh "你的文章标题"
#
# 执行流程:
#   1. git add .          暂存所有变更
#   2. git commit -m "..." 提交（带 feat: 前缀）
#   3. git push origin main 推送到远端
#
# 推送成功后，GitHub Actions / Vercel / Cloudflare Pages 等 CI/CD
# 会自动检测到 main 分支变更并触发构建部署。
# =============================================================================

set -euo pipefail

TITLE="${1:-}"

# ---- 参数校验 ----
if [ -z "$TITLE" ]; then
  echo "❌ 缺少参数：请提供博客标题"
  echo ""
  echo "用法: ./scripts/deploy-blog.sh \"博客标题\""
  echo "示例: ./scripts/deploy-blog.sh \"Docker Compose 部署 New-API + Sub2API + CPA\""
  exit 1
fi

# ---- 切换到项目根目录 ----
cd "$(dirname "$0")/.."

# ---- 检查是否有变更 ----
if git diff --quiet && git diff --cached --quiet; then
  echo "⚠️  没有检测到任何变更，无需提交。"
  exit 0
fi

# ---- git add ----
echo "📝 暂存所有变更..."
git add .

# ---- git commit ----
COMMIT_MSG="feat: $TITLE"
echo ""
echo "📦 提交: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# ---- git push ----
echo ""
echo "🚀 推送到 origin main..."
git push origin main

echo ""
echo "✅ 部署完成！推送成功，等待 CI/CD 自动构建部署..."
