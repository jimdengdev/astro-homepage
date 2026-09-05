# Jimdeng's Blog

个人博客，基于 [astro-koharu](https://github.com/cosZone/astro-koharu) 主题搭建。

> Code is cheap, show me the prompt.

## 关于本仓库

博客代码拷贝自上游 [cosZone/astro-koharu](https://github.com/cosZone/astro-koharu)，在此基础上做了大量个人化定制：

- 相册 / Memos 日记功能
- GA4 站点分析
- 自定义主题色（蓝色调）
- 中英文双语支持
- 个性化首页配置

如果想使用主题原版功能，建议直接 fork 上游仓库。

## 致谢

- 主题：[astro-koharu](https://github.com/cosZone/astro-koharu)
- 设计灵感：[Hexo Shoka](https://shoka.lostyu.me/computer-science/note/theme-shoka-doc/)

## 开发

```bash
pnpm install
pnpm dev          # 启动开发服务器 http://localhost:4321
pnpm build        # 构建生产版本
pnpm koharu backup  # 备份博客内容
```

详细架构说明见 `CLAUDE.md`。