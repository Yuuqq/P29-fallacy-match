# P29 Spec - 逻辑谬误连连看

## 1. Summary

- **Project ID**: P29
- **Project Name**: 逻辑谬误连连看
- **Goal**: 卡牌连线游戏，将新闻案例与对应逻辑谬误匹配
- **User Persona**: 新闻学生 / 培训讲师

## 2. Scope

- **In scope**:
  - 卡牌连线游戏
  - 将新闻案例与对应逻辑谬误匹配
- **Out of scope**:
  - 后端代理或服务端逻辑
  - API Key 持久化存储

## 3. UX

- **Core workflow**: 用户输入 → 前端处理 → 结果展示
- **Inputs**: 预设题组
- **Outputs**: 配对结果 + 谬误解释
- **States**: empty (初始) / loading (处理中) / error (失败) / success (完成)

## 4. Functional Requirements

1. FR-1: 卡牌连线游戏
2. FR-2: 结果可视化展示
3. FR-3: 错误状态可见提示

## 5. Non-Functional Requirements

- **Performance**: 核心任务 3 分钟内完成
- **Accessibility**: 键盘导航、aria-label、焦点可见、WCAG AA 对比度
- **Privacy**: 本地处理优先，不默认上传数据
- **Browser support**: 现代 Chromium (Chrome 110+)

## 6. Dependencies

- **Libraries/CDNs**: 无外部依赖
- **Local data**: 无

## 7. Risks & Mitigations

- **Risk**: 题目数量有限
- **Mitigation**: 支持 JSON 自定义题库

## 8. Acceptance Criteria

- [ ] 核心功能可正常使用
- [ ] 纯静态，无后端依赖
- [ ] 移动端响应式
- [ ] 隐私提示可见
- [ ] 纯静态页面可部署 GitHub Pages
- [ ] 移动端可用
- [ ] 隐私提示清晰可见
