# Code Review Summary: P29-fallacy-match

This document summarizes the findings from a comprehensive code review of the `P29-fallacy-match` repository, focusing on architecture, security, reliability, test coverage, maintainability, and developer experience.

## Overview
The application is a well-built, zero-dependency, static vanilla HTML/JS/CSS tool. It successfully uses modern web features (Service Workers, CSS variables, event delegation) and defensively parses JSON and escapes HTML dynamically. However, there are some reliability and test coverage areas that need addressing.

---

## 🔴 CRITICAL
*(None found. The application is well-contained, correctly relies on client-side state, and is free from critical security vulnerabilities.)*

---

## 🟠 HIGH

### 1. Service Worker Cache Collision & Aggressive Pruning (Reliability)
- **File**: `sw.js` (lines 9, 32-34)
- **Impact**: The Service Worker uses a global cache name `CACHE_NAME = "journalism-tool-v1"`. During activation, it deletes *all* caches that do not exactly match this name. The file comment mentions it is "适用于全部 50 个新闻工具项目". If multiple tools are hosted on the same origin (e.g., under different paths on `yuuqq.github.io`), updating one tool's cache name to `v2` will wipe out the cached assets of all other 49 tools for the user, defeating offline capabilities across the suite.
- **Fix Suggestion**: Namespace the cache name by the specific project ID, and prefix-check before deleting.
  ```javascript
  const CACHE_NAME = "journalism-tool-p29-v1";
  // Activation cleanup:
  keys.filter((k) => k.startsWith("journalism-tool-p29-") && k !== CACHE_NAME)
      .map((k) => caches.delete(k))
  ```

### 2. Lack of Automated Testing for Core Pedagogical Logic (Test Coverage)
- **File**: `app.js` (lines 142-230, e.g., `weightedPickUnique`, `pickFallacies`)
- **Impact**: The core value of the tool relies on a spaced-repetition algorithm (tracking streaks, recency, and weakness). This pure mathematical logic is highly prone to silent logic regressions. Because there are no unit tests, a developer tweaking the weighting values could easily break the learning experience (e.g., causing the pool to never show certain questions) without noticing.
- **Fix Suggestion**: Set up a lightweight test runner (e.g., `Vitest` or `Jest`) or even a simple Node-based script. Export or expose pure functions like `weightedPickUnique`, `accuracy`, and `pickFallacies` and write unit tests to assert their distribution and edge-case handling (e.g., when a user has a 0% vs 100% success rate).

---

## 🟡 MEDIUM

### 3. Monolithic File Architecture (Maintainability & Extensibility)
- **File**: `app.js` (lines 28-117)
- **Impact**: The application state, UI logic, event delegation, and question database (`FALLACIES`, `SCENARIOS`) are completely intertwined in a single IIFE of 600+ lines. If non-developers (e.g., educators, editors) want to update the fallacies or scenarios, they must edit source code, risking syntax errors that would break the entire app.
- **Fix Suggestion**: Extract the static data into a separate file (e.g., `data.js` attaching to `window.P29Data`, or fetched via `fetch('data.json')`). This separation of concerns improves maintainability.

### 4. Silent Failure on LocalStorage Exhaustion (Reliability / Error Handling)
- **File**: `app.js` (lines 173-176) & `pm-metrics.js` (lines 28-32)
- **Impact**: The `writeProgress` and `writeEvents` functions use a `try/catch` block that silently swallows exceptions. If the user's `localStorage` is full, or they are in a strict incognito mode that blocks storage, the app continues functioning but their progress is immediately lost upon reload. The user is never informed.
- **Fix Suggestion**: If a `setItem` operation fails, surface a visible UI notification (or use the existing Toast system) to warn the user: *"无法保存进度：存储空间不足或已被浏览器禁用。"*

---

## 🟢 LOW

### 5. Missing Developer Onboarding & Local Setup Instructions (Doc/DX)
- **File**: `README.md`
- **Impact**: New contributors will naturally try to open `index.html` via the `file://` protocol. Because the app registers a Service Worker and utilizes ES modules, this will fail in modern browsers due to CORS/security restrictions.
- **Fix Suggestion**: Add a "Developer Guide" section in the `README.md` providing a one-liner to spin up a local server, such as:
  ```bash
  # Start a local development server
  npx serve .
  # or
  python3 -m http.server
  ```

### 6. Defense in Depth: Missing Content Security Policy (Security)
- **File**: `index.html`
- **Impact**: The code correctly uses an `esc()` function to manually sanitize all dynamic strings before interpolating them into `innerHTML`. However, manual escaping is prone to human error during future updates.
- **Fix Suggestion**: Add a `<meta http-equiv="Content-Security-Policy" content="...">` header. Since it's a static site, restricting scripts and frame execution adds a robust layer of defense against accidental XSS regressions.

### 7. Repeated ID Lookups on Every Interaction (Performance / Edge Case)
- **File**: `app.js` (lines 352-364, `checkRound`)
- **Impact**: Operations like `getItems()` use `document.querySelectorAll` each time they are called. While harmless for an app containing only a dozen DOM nodes, caching the references or maintaining an internal state array instead of constantly scraping the DOM for `dataset.assignedId` is a better architectural pattern.
- **Fix Suggestion**: Minor refactoring to keep a single source of truth in the JS state, rendering downward to the DOM, rather than querying the DOM to determine state.