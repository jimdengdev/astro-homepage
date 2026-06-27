#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# astro-koharu 本地启动脚本
# 用法: ./scripts/dev.sh [选项]
#
# 选项:
#   --install      仅安装依赖
#   --generate     生成内容资产后启动
#   --build        构建生产版本并预览
#   --check        运行类型检查
#   --help         显示帮助信息
# =============================================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# 日志函数
log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

print_banner() {
    echo ""
    echo -e "${CYAN}  ╔═══════════════════════════════════════╗${NC}"
    echo -e "${CYAN}  ║       🌸  astro-koharu 启动脚本  🌸    ║${NC}"
    echo -e "${CYAN}  ╚═══════════════════════════════════════╝${NC}"
    echo ""
}

print_help() {
    echo "用法: ./scripts/dev.sh [选项]"
    echo ""
    echo "选项:"
    echo "  (无参数)     安装依赖并启动开发服务器"
    echo "  --install    仅安装依赖"
    echo "  --generate   生成内容资产 (LQIP/相似度/摘要) 并启动"
    echo "  --build      构建生产版本并预览"
    echo "  --check      运行类型检查"
    echo "  --cms        启动本地 CMS 管理界面"
    echo "  --help       显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./scripts/dev.sh              # 快速启动"
    echo "  ./scripts/dev.sh --generate   # 首次启动，生成所有资产"
    echo "  ./scripts/dev.sh --build      # 预览生产构建"
    echo "  ./scripts/dev.sh --cms        # 仅启动 CMS"
}

# ---------------------------------------------------------------------------
# 1. 环境检查
# ---------------------------------------------------------------------------
check_node() {
    if ! command -v node &>/dev/null; then
        log_error "未检测到 Node.js，请先安装 Node.js >= 18"
        log_info "推荐使用 nvm: https://github.com/nvm-sh/nvm"
        log_info "或 fnm: https://github.com/Schniz/fnm"
        exit 1
    fi
    local node_version
    node_version=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$node_version" -lt 18 ]; then
        log_error "Node.js 版本过低 (当前: $(node -v))，需要 >= 18"
        exit 1
    fi
    log_success "Node.js $(node -v)"
}

check_pnpm() {
    if ! command -v pnpm &>/dev/null; then
        log_warn "未检测到 pnpm，正在安装..."
        if command -v corepack &>/dev/null; then
            corepack enable
            corepack prepare pnpm@latest --activate
        else
            npm install -g pnpm
        fi
        if command -v pnpm &>/dev/null; then
            log_success "pnpm 安装成功 ($(pnpm -v))"
        else
            log_error "pnpm 安装失败，请手动安装: npm install -g pnpm"
            exit 1
        fi
    else
        log_success "pnpm $(pnpm -v)"
    fi
}

# ---------------------------------------------------------------------------
# 2. 安装依赖
# ---------------------------------------------------------------------------
install_deps() {
    if [ ! -d "node_modules" ]; then
        log_warn "node_modules 不存在，正在安装依赖..."
        pnpm i
        log_success "依赖安装完成"
    elif [ ! -f "node_modules/.modules.yaml" ] && [ ! -d "node_modules/.pnpm" ]; then
        log_warn "node_modules 可能不完整，重新安装依赖..."
        pnpm i
        log_success "依赖安装完成"
    else
        log_info "依赖已存在，跳过安装 (如需重新安装请执行: rm -rf node_modules && pnpm i)"
    fi
}

# ---------------------------------------------------------------------------
# 3. 检查配置文件
# ---------------------------------------------------------------------------
check_config() {
    if [ ! -f "config/site.yaml" ]; then
        log_warn "config/site.yaml 不存在，请先配置站点信息"
        log_info "参考 README.md 中的配置说明"
    else
        log_success "配置文件 config/site.yaml 已就绪"
    fi

    if [ ! -f ".env" ]; then
        log_warn ".env 文件不存在 (AI 摘要等功能需要)"
        log_info "如不需要 AI 摘要功能可忽略"
    fi
}

# ---------------------------------------------------------------------------
# 4. 启动命令
# ---------------------------------------------------------------------------
start_dev() {
    log_info "启动开发服务器..."
    echo ""
    log_info "🌐 访问地址: ${CYAN}http://localhost:4321${NC}"
    echo ""
    pnpm dev
}

start_build_preview() {
    log_info "构建生产版本..."
    pnpm build
    log_success "构建完成"
    echo ""
    log_info "启动预览服务器..."
    echo ""
    log_info "🌐 访问地址: ${CYAN}http://localhost:4321${NC}"
    echo ""
    pnpm preview
}

start_generate_and_dev() {
    log_info "生成内容资产..."
    pnpm run generate:lqips
    log_success "LQIP 生成完成"
    echo ""
    log_info "启动开发服务器..."
    echo ""
    log_info "🌐 访问地址: ${CYAN}http://localhost:4321${NC}"
    echo ""
    pnpm dev
}

start_cms() {
    if [ ! -d "cms/node_modules" ]; then
        log_warn "CMS 依赖未安装，正在安装..."
        cd cms && pnpm install && cd ..
    fi
    log_info "启动 CMS 管理界面..."
    echo ""
    log_info "🌐 CMS 地址: ${CYAN}http://localhost:5173${NC}"
    log_info "📝 开发服务器: ${CYAN}http://localhost:4321${NC}"
    echo ""
    pnpm cms
}

run_check() {
    log_info "运行 TypeScript 类型检查..."
    pnpm check
    log_success "类型检查完成"
}

# ---------------------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------------------
main() {
    print_banner

    # 环境检查
    check_node
    check_pnpm

    # 根据参数执行不同操作
    case "${1:-}" in
        --help|-h)
            print_help
            exit 0
            ;;
        --install)
            install_deps
            log_success "依赖安装完成!"
            exit 0
            ;;
        --generate)
            check_config
            install_deps
            start_generate_and_dev
            ;;
        --build)
            check_config
            install_deps
            start_build_preview
            ;;
        --check)
            install_deps
            run_check
            ;;
        --cms)
            check_config
            install_deps
            start_cms
            ;;
        "")
            # 默认：安装依赖并启动开发服务器
            check_config
            install_deps
            start_dev
            ;;
        *)
            log_error "未知参数: $1"
            print_help
            exit 1
            ;;
    esac
}

main "$@"
