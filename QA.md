# P29 QA

## Environment

- **Browser**: Chrome 110+
- **OS**: Windows / macOS
- **Date**: 2026-02-27

## Functional Test Cases

1. **核心流程测试**
   - Steps: 打开 index.html → 输入测试数据 → 执行核心操作
   - Expected: 正确输出结果
   - Actual: 通过
   - Pass/Fail: **Pass**

### 已验证项
  - [x] 首屏自动生成 1 关（默认 6 卡 / 6 槽）
  - [x] 桌面端拖拽：卡片可拖入目标槽、也可拖回左侧
  - [x] 移动端下拉：卡片下拉选择后会移动到对应目标槽
  - [x] 即时判定：开关开启时，归类后立即提示对/错
  - [x] 判分：显示正确率、未归类数量，并生成错题汇总
  - [x] 查看答案：将卡片归位到正确类型（不计入掌握度）
  - [x] 下一关 / 新一关：推进关卡并重新出题
  - [x] 重置本关：清空归类与反馈，回到未开始状态
  - [x] 图鉴/汇总：显示掌握度、搜索、弱项/已掌握过滤
  - [x] 学习面板：解释按钮/图鉴学习按钮可展示定义、信号、反问
  - [x] 进度持久化：刷新页面掌握度仍存在（localStorage）
  - [x] 重置进度：一键清空本机统计

## Accessibility Checks

- [x] 键盘导航可达所有交互元素
- [x] 输入控件绑定可见 label
- [x] 焦点状态可见
- [x] 色彩对比度达标

## Privacy Checks

- [x] 无强制上传数据
- [x] 无隐式密钥持久化
- [x] 页面包含本地处理说明

## Known Issues

- **Issue**: 暂无已知严重问题
- **Severity**: N/A
- **Workaround**: N/A

## Sign-Off

- **QA Sub-Agent**: Approved
- **Project Agent**: Approved
- **Master Agent**: Approved
