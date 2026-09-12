# Code Review Summary: P29-fallacy-match

## Overview
This document summarizes the findings from a code review of the `P29-fallacy-match` repository. The application is a well-built, zero-dependency, static vanilla HTML/JS/CSS tool. However, there is a critical grading integrity bug and a few reliability areas that require attention.

---

### 合并就绪度

| 检查项 | 结果 |
| --- | --- |
| 运行时回归 | 低 |
| REVIEW.md 准确性 | **通过** — 行号与事实已修正 |
| 完整性 | **通过** — 包含对破坏掌握度统计的缺陷记录 |
| CI | 无 |
| git 可合并 | CLEAN / MERGEABLE |

---

## 🔴 CRITICAL

### 1. 评分完整性漏洞 (Grading Integrity Bypass)
- **File**: `app.js` (lines 358-427 `checkRound`, lines 429-438 `revealAnswers`)
- **Impact**: 存在破坏掌握度统计的严重缺陷。首先，用户可以无限制地多次点击“判分”按钮，导致统计数据中无限增加尝试次数和正确率。其次，用户点击“查看答案”(`revealAnswers`) 后，再点击“判分”(`checkRound`)，会被系统判定为全部正确并计入掌握度，这直接违背了 `QA.md` 中要求的“查看答案（不计入掌握度）”。
- **Fix**: 在 `checkRound` 开头增加 `if (state.round.checked) return;` 防御；在 `revealAnswers` 中增加 `state.round.checked = true;` 防止后续判分。

---

## 🟡 MEDIUM

### 2. Service Worker Cache Collision & Aggressive Pruning (Reliability)
- **File**: `sw.js` (lines 11, 37-41)
- **Impact**: Service Worker 使用了全局缓存名 `CACHE_NAME = "journalism-tool-v1"`。在激活阶段，它会删除所有与该名称不完全匹配的缓存。如果在同一域名下托管多个工具项目，更新本项目缓存将导致其他项目的缓存被全部清空，破坏它们的离线能力。
- **Fix**: 将缓存命名空间化为 `journalism-tool-p29-v1`，并在删除前进行前缀匹配。

### 3. Silent Failure on LocalStorage Exhaustion (Error Handling)
- **File**: `app.js` (lines 165-169) & `pm-metrics.js` (lines 35-39)
- **Impact**: `writeProgress` 和 `writeEvents` 使用了空的 `try/catch` 块。当用户的 `localStorage` 空间耗尽或在严格无痕模式下被禁用时，进度保存失败但用户没有任何感知。

---

## 🟢 LOW

### 4. Lack of Automated Testing for Pedagogical Logic (Test Coverage)
- **File**: `app.js` (lines 230-272)
- **Impact**: 间隔重复与难度权重的数学逻辑（如 `weightedPickUnique`）缺乏单元测试，未来修改极易引发隐性回归。

### 5. Missing Developer Onboarding & Local Setup Instructions (Doc/DX)
- **File**: `README.md`
- **Impact**: 因使用 Service Worker 及 ES Modules，直接双击 `index.html` 无法在现代浏览器中运行。需要增加关于启动本地服务器（如 `npx serve .`）的说明。

### 6. Repeated ID Lookups on Every Interaction (Performance / Edge Case)
- **File**: `app.js` (lines 358-427, `checkRound`)
- **Impact**: 每次操作都通过 `document.querySelectorAll` 重新获取 DOM 状态（如 `dataset.assignedId`），未维护 JS 内部的单点数据源。
