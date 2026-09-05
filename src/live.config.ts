// 上游 6.3.0 新增 Koharu Suite Moments 功能（需要 KOHARU_SUITE_URL）。
// 当前仓库未启用：site-config 未配 momentsConfig.enabled，且无 Koharu Suite 后端。
// 设为空集合即可跳过该 live collection。
export const collections = {} as Record<string, never>;
