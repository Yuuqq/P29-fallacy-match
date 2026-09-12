(() => {
  const $ = (id) => document.getElementById(id);

  const els = {
    openLibraryBtn: $("openLibraryBtn"),
    closeLibraryBtn: $("closeLibraryBtn"),
    resetProgressBtn: $("resetProgressBtn"),
    sizeSelect: $("sizeSelect"),
    modeSelect: $("modeSelect"),
    instantToggle: $("instantToggle"),
    newRoundBtn: $("newRoundBtn"),
    levelPill: $("levelPill"),
    comments: $("comments"),
    targets: $("targets"),
    checkBtn: $("checkBtn"),
    revealBtn: $("revealBtn"),
    nextBtn: $("nextBtn"),
    resetRoundBtn: $("resetRoundBtn"),
    status: $("status"),
    learnPanel: $("learnPanel"),
    mistakes: $("mistakes"),
    libraryPanel: $("libraryPanel"),
    summaryGrid: $("summaryGrid"),
    searchInput: $("searchInput"),
    filterSelect: $("filterSelect"),
    libraryList: $("libraryList")
  };

  if (!els.comments || !els.targets || !els.status) return;

  const STORAGE_KEY = "p29_fallacy_progress_v2";
  const RECENT_KEY = "p29_recent_scenarios_v2";

  const FALLACIES = [
    { id: "strawman", name: "稻草人谬误", oneLine: "歪曲/夸大对方观点后再反驳", signals: ["把“部分”说成“全部”", "反驳的是“你没说过的观点”"], counters: ["请先复述我原观点。", "我说A，你为何在反驳B？"] },
    { id: "ad_hominem", name: "人身攻击", oneLine: "攻击人而不是讨论论点", signals: ["贴标签替代证据", "用动机猜测代替论证"], counters: ["先不谈人，证据是什么？", "就算我有问题，论点哪里错？"] },
    { id: "appeal_authority", name: "诉诸权威", oneLine: "用头衔/名气替代理由", signals: ["只给头衔不给证据", "权威不在相关领域"], counters: ["证据/数据来源是什么？", "有没有相反研究与复现？"] },
    { id: "appeal_emotion", name: "诉诸情感", oneLine: "用愤怒/同情替代理由", signals: ["道德绑架推动结论", "情绪强≠证据强"], counters: ["可核查事实是什么？", "情绪之外推理链条在哪？"] },
    { id: "appeal_tradition", name: "诉诸传统", oneLine: "因为“以前一直这样”就认为必须这样", signals: ["把习惯当理由", "忽略环境变化"], counters: ["原因还存在吗？", "有没有更好替代与证据？"] },
    { id: "bandwagon", name: "诉诸大众（从众）", oneLine: "因为“很多人都这么做”就认为对", signals: ["热度=真理", "群体压力压制质疑"], counters: ["证据在哪里？", "样本来自哪里，是否偏？"] },
    { id: "false_dilemma", name: "错误两难", oneLine: "把复杂问题硬拆成二选一", signals: ["非黑即白", "忽略中间方案"], counters: ["除了A/B还有C吗？", "哪些前提被当成不可变？"] },
    { id: "slippery_slope", name: "滑坡谬误", oneLine: "从小变化直接推到灾难结局", signals: ["缺少中间环节证据", "把可能性当必然"], counters: ["每一步因果证据是什么？", "边界条件/止损机制在哪？"] },
    { id: "hasty_generalization", name: "以偏概全", oneLine: "用少量个例推出整体结论", signals: ["几个故事=规律", "忽略基线率与反例"], counters: ["样本量与抽样方式？", "总体分布/反例在哪里？"] },
    { id: "false_cause", name: "因果谬误（相关≠因果）", oneLine: "把相关/先后当作因果", signals: ["A后发生B所以A导致B", "忽略第三变量"], counters: ["有对照/反事实吗？", "机制是什么，可复现吗？"] },
    { id: "circular", name: "循环论证", oneLine: "用结论当理由，绕一圈回到结论", signals: ["同义反复没新增信息", "证明依赖被证明对象"], counters: ["给一个独立证据？", "不先接受结论理由还成立吗？"] },
    { id: "equivocation", name: "偷换概念", oneLine: "关键词在论证中悄悄换了意思", signals: ["定义模糊且多义", "前后语境含义不同"], counters: ["这里关键词具体指什么？", "前后用的是同一定义吗？"] },
    { id: "red_herring", name: "红鲱鱼（转移话题）", oneLine: "把讨论从关键点引到无关点", signals: ["回答不对题", "用刺激话题替代证据问题"], counters: ["这和原问题有何关系？", "请回到证据：来源是什么？"] },
    { id: "appeal_ignorance", name: "诉诸无知", oneLine: "把“没被证伪/证真”当作结论成立", signals: ["缺证当证据", "倒置举证责任"], counters: ["谁主张谁举证。", "可检验标准/预测是什么？"] },
    { id: "cherry_picking", name: "樱桃采摘", oneLine: "只挑对自己有利的证据", signals: ["只说成功不说失败", "只挑某些指标/窗口"], counters: ["完整数据集在哪里？", "反例/失败案例有多少？"] },
    { id: "moving_goalposts", name: "移动门柱", oneLine: "不断提高/改变标准以避免承认对方成立", signals: ["满足一个条件就换一个", "标准不事先约定"], counters: ["先约定证据标准。", "满足后你会修正观点吗？"] }
  ];

  const SCENARIOS = [
    { id: "sc_straw_1", fallacyId: "strawman", text: "你说要“规范直播带货”，就是想把互联网都关了。", analysis: "把“规范”夸大为“关闭”，反驳歪曲观点。" },
    { id: "sc_straw_2", fallacyId: "strawman", text: "你建议少糖饮食？那你就是要禁止所有甜品。", analysis: "把“减少摄入”偷换成“全面禁止”。" },

    { id: "sc_ad_1", fallacyId: "ad_hominem", text: "你一个外行，根本没资格评价这个方案。", analysis: "用身份否定论点，回避证据讨论。" },
    { id: "sc_ad_2", fallacyId: "ad_hominem", text: "他人品就那样，他讲的数据肯定不靠谱。", analysis: "把人格印象当真假依据。" },

    { id: "sc_auth_1", fallacyId: "appeal_authority", text: "某大V都说是真的，所以不用查来源。", analysis: "用名气替代证据与可核查来源。" },
    { id: "sc_auth_2", fallacyId: "appeal_authority", text: "这位教授说有效，那就一定有效。", analysis: "没有讨论方法、样本与复现，只靠头衔。" },

    { id: "sc_emo_1", fallacyId: "appeal_emotion", text: "不同意的人就是在伤害无辜，你还有良心吗？", analysis: "用道德压力替代理由。" },
    { id: "sc_emo_2", fallacyId: "appeal_emotion", text: "这么感人的故事你还要证据？太冷血了。", analysis: "情绪强不代表推理成立。" },

    { id: "sc_trad_1", fallacyId: "appeal_tradition", text: "我们一直这么审批的，没必要改流程。", analysis: "把惯例当成合理性证明。" },
    { id: "sc_trad_2", fallacyId: "appeal_tradition", text: "祖辈都这么做，经验不可能错。", analysis: "历史做法不必然适用于当下。" },

    { id: "sc_band_1", fallacyId: "bandwagon", text: "全网都在买这个产品，肯定不会差。", analysis: "热度不等于质量，需要证据。" },
    { id: "sc_band_2", fallacyId: "bandwagon", text: "大家都转发了，你还怀疑？", analysis: "把传播量当真伪标准。" },

    { id: "sc_dilemma_1", fallacyId: "false_dilemma", text: "要么完全公开数据，要么就别谈透明。", analysis: "忽略分级、脱敏等中间方案。" },
    { id: "sc_dilemma_2", fallacyId: "false_dilemma", text: "你不支持这项措施，就是反对一切改进。", analysis: "把对具体措施的质疑偷换成反对改进。" },

    { id: "sc_slope_1", fallacyId: "slippery_slope", text: "今天允许一个小例外，明天就会彻底失控。", analysis: "缺少中间环节证据，直接推到极端。" },
    { id: "sc_slope_2", fallacyId: "slippery_slope", text: "给孩子玩10分钟游戏，迟早会荒废人生。", analysis: "从小行为跳到灾难结局，链条缺证。" },

    { id: "sc_hasty_1", fallacyId: "hasty_generalization", text: "我认识两个人都被坑过，所以这行业都是骗子。", analysis: "个例不足以推出整体结论。" },
    { id: "sc_hasty_2", fallacyId: "hasty_generalization", text: "看了几个差评，这家公司就一定不行。", analysis: "样本小且可能偏，缺少总体数据。" },

    { id: "sc_cause_1", fallacyId: "false_cause", text: "自从换了新logo，销量就下滑，所以logo导致销量跌。", analysis: "时间先后不等于因果，可能有混杂因素。" },
    { id: "sc_cause_2", fallacyId: "false_cause", text: "我喝了这杯饮料第二天就好了，肯定是它治好的。", analysis: "可能自愈/其他因素，缺对照与机制。" },

    { id: "sc_circ_1", fallacyId: "circular", text: "这条规定是合理的，因为它就是规定。", analysis: "理由只是重述结论，没有独立支撑。" },
    { id: "sc_circ_2", fallacyId: "circular", text: "他的话可信，因为他是个可信的人。", analysis: "用“可信”证明“可信”，形成闭环。" },

    { id: "sc_equiv_1", fallacyId: "equivocation", text: "这产品很“自然”，所以一定安全。", analysis: "“自然”被偷换成“安全”。" },
    { id: "sc_equiv_2", fallacyId: "equivocation", text: "数据是“公开”的，所以任何人都能随便用。", analysis: "“公开”不等于“无限授权”。" },

    { id: "sc_red_1", fallacyId: "red_herring", text: "别谈数据口径了，你先解释你为什么总爱挑刺。", analysis: "把证据问题引到个人动机。" },
    { id: "sc_red_2", fallacyId: "red_herring", text: "你说报告有问题？那你怎么不去做公益！", analysis: "用无关道德议题岔开质疑。" },

    { id: "sc_ignor_1", fallacyId: "appeal_ignorance", text: "没人能证明它是假的，所以它就是真的。", analysis: "缺证不是证据，且倒置举证责任。" },
    { id: "sc_ignor_2", fallacyId: "appeal_ignorance", text: "科学解释不了的，就一定是某种神秘力量。", analysis: "从未知跳到特定解释，中间缺证。" },

    { id: "sc_cherry_1", fallacyId: "cherry_picking", text: "只看这三张截图就知道他一直在撒谎。", analysis: "只挑局部材料，忽略完整上下文。" },
    { id: "sc_cherry_2", fallacyId: "cherry_picking", text: "我们选了最好的十个案例，足以证明方案成功。", analysis: "选择性展示，失败样本被隐藏。" },

    { id: "sc_goal_1", fallacyId: "moving_goalposts", text: "给了数据不算，要原始日志；给了日志还要第三方审计。", analysis: "不断提高标准以避免承认对方满足条件。" },
    { id: "sc_goal_2", fallacyId: "moving_goalposts", text: "你复现了也不行，必须在我指定设备上复现。", analysis: "标准随时变化，讨论无法收敛。" }
  ];

  const fallacyById = Object.fromEntries(FALLACIES.map((f) => [f.id, f]));
  const scenarioById = Object.fromEntries(SCENARIOS.map((s) => [s.id, s]));
  const scenariosByFallacy = (() => {
    const map = {};
    SCENARIOS.forEach((s) => {
      if (!map[s.fallacyId]) map[s.fallacyId] = [];
      map[s.fallacyId].push(s);
    });
    return map;
  })();

  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function pct(n) {
    const x = Number.isFinite(n) ? clamp(n, 0, 1) : 0;
    return `${Math.round(x * 100)}%`;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function defaultProgress() {
    return { version: 2, level: 1, rounds: 0, total_attempts: 0, total_correct: 0, fallacies: {}, scenarios: {} };
  }

  function safeJsonParse(raw, fallback) {
    try {
      const p = JSON.parse(raw);
      return p ?? fallback;
    } catch (_e) {
      return fallback;
    }
  }

  function readProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const p = raw ? safeJsonParse(raw, defaultProgress()) : defaultProgress();
      if (!p || typeof p !== "object" || p.version !== 2) return defaultProgress();
      p.fallacies = p.fallacies && typeof p.fallacies === "object" ? p.fallacies : {};
      p.scenarios = p.scenarios && typeof p.scenarios === "object" ? p.scenarios : {};
      p.level = Number.isFinite(Number(p.level)) ? Math.max(1, Number(p.level)) : 1;
      p.rounds = Number.isFinite(Number(p.rounds)) ? Math.max(0, Number(p.rounds)) : 0;
      p.total_attempts = Number.isFinite(Number(p.total_attempts)) ? Math.max(0, Number(p.total_attempts)) : 0;
      p.total_correct = Number.isFinite(Number(p.total_correct)) ? Math.max(0, Number(p.total_correct)) : 0;
      return p;
    } catch (_e) {
      return defaultProgress();
    }
  }

  function writeProgress(p) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (_e) {
      if (window.showToast) window.showToast("无法保存进度：存储空间不足或已被浏览器禁用。", "error");
      else alert("无法保存进度：存储空间不足或已被浏览器禁用。");
    }
  }

  function readRecent() {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const ids = raw ? safeJsonParse(raw, []) : [];
      return Array.isArray(ids) ? ids.filter((x) => typeof x === "string").slice(-40) : [];
    } catch (_e) {
      return [];
    }
  }

  function writeRecent(ids) {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(-40)));
    } catch (_e) {}
  }

  let progress = readProgress();
  const state = { round: { fallacyIds: [], checked: false } };

  function fallacyStat(id) {
    if (!progress.fallacies[id]) progress.fallacies[id] = { attempts: 0, correct: 0, streak: 0, lastTs: 0 };
    return progress.fallacies[id];
  }

  function scenarioStat(id) {
    if (!progress.scenarios[id]) progress.scenarios[id] = { attempts: 0, correct: 0, lastTs: 0 };
    return progress.scenarios[id];
  }

  function accuracy(stat) {
    if (!stat || !stat.attempts) return 0;
    return stat.correct / stat.attempts;
  }

  function badgeFor(id) {
    const s = fallacyStat(id);
    const acc = accuracy(s);
    if (s.attempts >= 5 && acc >= 0.8) return { label: "已掌握", cls: "good", acc };
    if (s.attempts >= 3 && acc < 0.6) return { label: "偏弱", cls: "bad", acc };
    if (s.attempts >= 1) return { label: "学习中", cls: "warn", acc };
    return { label: "未练习", cls: "", acc };
  }

  function setStatus(text) {
    els.status.textContent = `状态: ${text}`;
  }

  function renderLevel() {
    if (!els.levelPill) return;
    els.levelPill.textContent = `关卡: ${progress.level}`;
  }

  function roundOptionHtml(fallacyIds) {
    return [
      '<option value="">未归类…</option>',
      ...fallacyIds.map((id) => `<option value="${esc(id)}">${esc(fallacyById[id]?.name || id)}</option>`)
    ].join("");
  }

  function weightedPickUnique(items, count, weightFn) {
    const pool = items.map((it) => ({ it, w: Math.max(0.001, Number(weightFn(it)) || 0.001) }));
    const picked = [];
    for (let k = 0; k < count && pool.length; k += 1) {
      const sum = pool.reduce((a, x) => a + x.w, 0);
      let r = Math.random() * sum;
      let idx = 0;
      for (let i = 0; i < pool.length; i += 1) {
        r -= pool[i].w;
        if (r <= 0) {
          idx = i;
          break;
        }
      }
      picked.push(pool.splice(Math.min(idx, pool.length - 1), 1)[0].it);
    }
    return picked;
  }

  function pickFallacies(size, mode) {
    const ids = FALLACIES.map((f) => f.id);
    const now = Date.now();
    return weightedPickUnique(ids, size, (id) => {
      const s = fallacyStat(id);
      const acc = accuracy(s);
      const novelty = s.attempts === 0 ? 1.2 : 0;
      const weakness = 1 - acc;
      const recency = s.lastTs ? Math.min(0.6, (now - s.lastTs) / (1000 * 60 * 30)) : 0.6;
      return mode === "review" ? 0.9 + novelty + weakness * 1.6 + recency : 1 + novelty * 0.7 + recency * 0.5;
    });
  }

  function pickScenario(fallacyId) {
    const list = scenariosByFallacy[fallacyId] || [];
    if (!list.length) return null;

    const recent = new Set(readRecent());
    const pool = list.filter((s) => !recent.has(s.id));
    const candidates = pool.length ? pool : list;

    const picked = weightedPickUnique(candidates, 1, (s) => {
      const st = scenarioStat(s.id);
      const novelty = st.attempts === 0 ? 1.2 : 0;
      const weakness = 1 - accuracy(st);
      return 1 + novelty + weakness * 1.2;
    })[0];

    return picked || candidates[Math.floor(Math.random() * candidates.length)];
  }

  function updateDropHints() {
    Array.from(els.targets.querySelectorAll(".target")).forEach((t) => {
      const has = t.querySelectorAll(".item").length > 0;
      const hint = t.querySelector(".dropHint");
      if (hint) hint.style.display = has ? "none" : "";
    });
  }

  function getItems() {
    return Array.from(document.querySelectorAll('.item[data-scenario-id]'));
  }

  function renderStatusLine(extra) {
    const items = getItems();
    const assigned = items.filter((i) => !!i.dataset.assignedId).length;
    const base = `已归类 ${assigned}/${items.length}`;
    setStatus(extra ? `${base}；${extra}` : base);
  }

  function assignItem(itemEl, fallacyId) {
    const id = fallacyId || "";
    itemEl.dataset.assignedId = id;

    const sel = itemEl.querySelector('select[data-role="assign"]');
    if (sel && sel.value !== id) sel.value = id;

    if (!id) {
      els.comments.appendChild(itemEl);
    } else {
      const box = els.targets.querySelector(`.target[data-fallacy-id="${id}"] .targetItems`);
      (box || els.comments).appendChild(itemEl);
    }

    if (!state.round.checked) {
      itemEl.classList.remove("ok", "bad");
      const feedback = itemEl.querySelector(".feedback");
      if (feedback) feedback.textContent = "";
    }

    if (!state.round.checked && els.instantToggle?.checked) {
      const answer = itemEl.dataset.answerId || "";
      const answerName = fallacyById[answer]?.name || answer;
      const feed = itemEl.querySelector(".feedback");
      if (feed) {
        if (!id) feed.textContent = "未归类：请选择一个类型";
        else if (id === answer) feed.textContent = "✅ 归类正确";
        else feed.textContent = `❌ 更像：${answerName}`;
      }
    }

    updateDropHints();
    renderStatusLine();
  }

  function clearMistakes() {
    if (!els.mistakes) return;
    els.mistakes.textContent = "（完成判分后会在这里汇总错题）";
  }

  function renderMistakes(mistakes) {
    if (!els.mistakes) return;
    if (!mistakes.length) {
      els.mistakes.textContent = "本关无错题。";
      return;
    }
    els.mistakes.innerHTML = mistakes
      .map(
        (m, idx) => `
        <div class="mistakeCard">
          <div class="mistakeT">${idx + 1}. ${esc(m.text)}</div>
          <div class="mistakeM">你的归类：${esc(m.assignedName || "未归类")}；正确：${esc(m.answerName)}</div>
          <div class="mistakeM">解析：${esc(m.analysis)}</div>
          <div class="mistakeM">反问：${esc(m.counter)}</div>
        </div>`
      )
      .join("");
  }

  function checkRound() {
    if (state.round.checked) return;
    const items = getItems();
    let ok = 0;
    let total = 0;
    let unassigned = 0;
    const mistakes = [];

    items.forEach((item) => {
      total += 1;
      const assigned = item.dataset.assignedId || "";
      const answer = item.dataset.answerId || "";
      const isOk = assigned && assigned === answer;
      if (!assigned) unassigned += 1;
      if (isOk) ok += 1;

      item.classList.toggle("ok", !!isOk);
      item.classList.toggle("bad", !isOk);

      const answerName = fallacyById[answer]?.name || answer;
      const assignedName = assigned ? fallacyById[assigned]?.name || assigned : "";
      const feedback = item.querySelector(".feedback");
      if (feedback) {
        feedback.textContent = assigned ? (isOk ? `✅ 正确：${answerName}` : `❌ 你选：${assignedName}；正确：${answerName}`) : `❌ 未归类；正确：${answerName}`;
      }

      if (!isOk) {
        const sc = scenarioById[item.dataset.scenarioId];
        const f = fallacyById[answer];
        mistakes.push({
          text: sc?.text || "",
          assignedName,
          answerName,
          analysis: sc?.analysis || "（无）",
          counter: f?.counters?.[0] || "这条结论缺了哪一步可核查证据？"
        });
      }

      // progress updates (mastery by正确类型)
      if (item.dataset.scenarioId) {
        const st = scenarioStat(item.dataset.scenarioId);
        st.attempts += 1;
        st.correct += isOk ? 1 : 0;
        st.lastTs = Date.now();
      }
      if (answer) {
        const fs = fallacyStat(answer);
        fs.attempts += 1;
        fs.correct += isOk ? 1 : 0;
        fs.streak = isOk ? fs.streak + 1 : 0;
        fs.lastTs = Date.now();
      }
    });

    progress.rounds += 1;
    progress.total_attempts += total;
    progress.total_correct += ok;
    writeProgress(progress);

    const recent = readRecent();
    items.forEach((i) => i.dataset.scenarioId && recent.push(i.dataset.scenarioId));
    writeRecent(recent);

    state.round.checked = true;
    renderMistakes(mistakes);
    renderStatusLine(`判分完成：${ok}/${total} 正确${unassigned ? `（未归类 ${unassigned}）` : ""}`);

    try {
      window.pmMetrics?.markTaskComplete?.("verification_core_task", { round_level: progress.level, correct: ok, total });
    } catch (_e) {}
  }

  function revealAnswers() {
    const items = getItems();
    items.forEach((item) => assignItem(item, item.dataset.answerId || ""));
    items.forEach((item) => {
      item.classList.remove("bad");
      item.classList.add("ok");
      const answer = item.dataset.answerId || "";
      const feedback = item.querySelector(".feedback");
      if (feedback) feedback.textContent = `✅ 答案：${fallacyById[answer]?.name || answer}`;
    });
    state.round.checked = true;
    renderStatusLine("已显示答案（不计入掌握度）");
  }

  function resetRound() {
    const items = getItems();
    items.forEach((item) => {
      item.dataset.assignedId = "";
      item.classList.remove("ok", "bad");
      const sel = item.querySelector('select[data-role="assign"]');
      if (sel) sel.value = "";
      const feedback = item.querySelector(".feedback");
      if (feedback) feedback.textContent = "";
      els.comments.appendChild(item);
    });
    state.round.checked = false;
    clearMistakes();
    updateDropHints();
    renderStatusLine("本关已重置");
  }

  function renderLearn(fallacyId) {
    const f = fallacyById[fallacyId];
    if (!f || !els.learnPanel) return;
    const st = fallacyStat(fallacyId);
    const b = badgeFor(fallacyId);
    els.learnPanel.innerHTML = `
      <div>
        <div><span class="k">${esc(f.name)}</span> <span class="badge ${esc(b.cls)}">${esc(b.label)}</span></div>
        <div class="learnMeta">练习次数：${st.attempts}；正确率：${pct(b.acc)}；连对：${st.streak}</div>
        <div class="learnOne"><span class="k">一句话：</span>${esc(f.oneLine)}</div>
        <div class="learnSec"><span class="k">识别信号</span><ul>${f.signals.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div class="learnSec"><span class="k">反制提问</span><ul>${f.counters.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div class="learnBox"><span class="k">通用三步法：</span>先找结论 → 再找理由 → 最后问“缺了哪一步证据/前提”。<br/>本页收录 ${FALLACIES.length} 种常见谬误（更完整的列表在不同教材中可达几十种以上）。</div>
      </div>`;
  }

  function renderSummary() {
    if (!els.summaryGrid) return;
    const totalTypes = FALLACIES.length;
    const mastered = FALLACIES.filter((f) => badgeFor(f.id).label === "已掌握").length;
    const weak = FALLACIES.filter((f) => {
      const l = badgeFor(f.id).label;
      return l === "偏弱" || l === "未练习";
    }).length;
    const overall = progress.total_attempts ? progress.total_correct / progress.total_attempts : 0;

    els.summaryGrid.innerHTML = [
      { v: `${mastered}/${totalTypes}`, k: "已掌握类型" },
      { v: `${weak}`, k: "弱项/未练习" },
      { v: pct(overall), k: "总体正确率" },
      { v: `${progress.total_attempts}`, k: "累计判分题数" }
    ]
      .map((m) => `<div class="metric"><div class="v">${esc(m.v)}</div><div class="k">${esc(m.k)}</div></div>`)
      .join("");
  }

  function renderLibraryList() {
    if (!els.libraryList) return;
    const q = (els.searchInput?.value || "").trim().toLowerCase();
    const filter = String(els.filterSelect?.value || "all");

    const rows = FALLACIES.filter((f) => {
      if (!q) return true;
      const hay = [f.name, f.oneLine, ...(f.signals || []), ...(f.counters || [])].join(" ").toLowerCase();
      return hay.includes(q);
    }).filter((f) => {
      const label = badgeFor(f.id).label;
      if (filter === "mastered") return label === "已掌握";
      if (filter === "weak") return label === "偏弱" || label === "未练习";
      return true;
    });

    els.libraryList.innerHTML = rows
      .map((f) => {
        const b = badgeFor(f.id);
        return `
        <div class="row">
          <div>
            <div class="t">${esc(f.name)}</div>
            <div class="m">${esc(f.oneLine)}</div>
          </div>
          <div>
            <span class="badge ${esc(b.cls)}">${esc(b.label)} · ${pct(b.acc)}</span>
            <button type="button" class="ghost mini" data-action="learn" data-fallacy-id="${esc(f.id)}" style="margin-top:8px">学习</button>
          </div>
        </div>`;
      })
      .join("");
  }

  function renderLibrary() {
    renderSummary();
    renderLibraryList();
  }

  function openLibrary() {
    if (!els.libraryPanel) return;
    els.libraryPanel.classList.remove("hidden");
    renderLibrary();
  }

  function closeLibrary() {
    if (!els.libraryPanel) return;
    els.libraryPanel.classList.add("hidden");
  }

  function startRound(advanceLevel) {
    if (advanceLevel) {
      progress.level += 1;
      writeProgress(progress);
    }

    const size = clamp(Number(els.sizeSelect?.value || 6), 6, 10);
    const mode = String(els.modeSelect?.value || "learn");

    const fallacyIds = pickFallacies(size, mode);
    state.round.fallacyIds = fallacyIds;
    state.round.checked = false;

    const optionsHtml = roundOptionHtml(fallacyIds);

    els.targets.innerHTML = fallacyIds
      .map((id, idx) => {
        const f = fallacyById[id];
        return `
        <div class="target" data-fallacy-id="${esc(id)}">
          <div class="targetHead">
            <div class="targetTitle">
              <span class="badge">#${idx + 1}</span>
              <strong>${esc(f?.name || id)}</strong>
            </div>
            <button type="button" class="ghost mini" data-action="explain" data-fallacy-id="${esc(id)}">解释</button>
          </div>
          <div class="targetDesc">${esc(f?.oneLine || "")}</div>
          <div class="dropHint">拖拽卡片到这里，或在卡片里用下拉框归类</div>
          <div class="targetItems stack" data-role="targetItems"></div>
        </div>`;
      })
      .join("");

    const scenarios = fallacyIds.map((id) => pickScenario(id)).filter(Boolean);
    els.comments.innerHTML = shuffle(scenarios)
      .map(
        (s) => `
      <div class="item" draggable="true" data-scenario-id="${esc(s.id)}" data-answer-id="${esc(s.fallacyId)}" data-assigned-id="">
        <div class="itemHead">
          <div class="itemText">${esc(s.text)}</div>
          <button type="button" class="ghost mini" data-action="hint" data-scenario-id="${esc(s.id)}">提示</button>
        </div>
        <div class="assign">
          <div>归类到</div>
          <select data-role="assign">${optionsHtml}</select>
        </div>
        <div class="feedback"></div>
      </div>`
      )
      .join("");

    clearMistakes();
    renderLevel();
    updateDropHints();
    renderStatusLine(mode === "review" ? "复习模式（弱项优先）" : "学习模式");

    try {
      window.pmMetrics?.markTaskStart?.("verification_core_task");
    } catch (_e) {}
  }

  // Delegated events (works after DOM moves)
  document.addEventListener("change", (e) => {
    const sel = e.target && e.target.matches ? (e.target.matches('select[data-role="assign"]') ? e.target : null) : null;
    if (!sel) return;
    const item = sel.closest(".item");
    if (!item) return;
    assignItem(item, sel.value);
  });

  document.addEventListener("click", (e) => {
    const btn = e.target && e.target.closest ? e.target.closest("button[data-action]") : null;
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === "explain") {
      renderLearn(btn.dataset.fallacyId || "");
    } else if (action === "learn") {
      renderLearn(btn.dataset.fallacyId || "");
    } else if (action === "hint") {
      const item = btn.closest(".item");
      const sc = scenarioById[btn.dataset.scenarioId || ""];
      const f = fallacyById[sc?.fallacyId];
      const feed = item?.querySelector(".feedback");
      if (feed) feed.textContent = f?.signals?.[0] ? `信号：${f.signals[0]}` : "先找结论，再看理由是否跳步。";
    }
  });

  // Drag and drop
  document.addEventListener("dragstart", (e) => {
    const item = e.target && e.target.closest ? e.target.closest(".item") : null;
    if (!item) return;
    try {
      e.dataTransfer.setData("text/plain", item.dataset.scenarioId || "");
    } catch (_e) {}
  });

  els.targets.addEventListener("dragover", (e) => {
    if (e.target && e.target.closest && e.target.closest(".target")) e.preventDefault();
  });
  els.targets.addEventListener("drop", (e) => {
    const t = e.target && e.target.closest ? e.target.closest(".target") : null;
    if (!t) return;
    e.preventDefault();
    const id = e.dataTransfer?.getData("text/plain") || "";
    if (!id) return;
    const item = document.querySelector(`.item[data-scenario-id="${id}"]`);
    if (!item) return;
    assignItem(item, t.dataset.fallacyId || "");
  });

  els.comments.addEventListener("dragover", (e) => e.preventDefault());
  els.comments.addEventListener("drop", (e) => {
    e.preventDefault();
    const id = e.dataTransfer?.getData("text/plain") || "";
    if (!id) return;
    const item = document.querySelector(`.item[data-scenario-id="${id}"]`);
    if (!item) return;
    assignItem(item, "");
  });

  // Top-level buttons
  els.openLibraryBtn?.addEventListener("click", openLibrary);
  els.closeLibraryBtn?.addEventListener("click", closeLibrary);
  els.searchInput?.addEventListener("input", renderLibraryList);
  els.filterSelect?.addEventListener("change", renderLibraryList);
  els.newRoundBtn?.addEventListener("click", () => startRound(true));
  els.nextBtn?.addEventListener("click", () => startRound(true));
  els.checkBtn?.addEventListener("click", checkRound);
  els.revealBtn?.addEventListener("click", revealAnswers);
  els.resetRoundBtn?.addEventListener("click", resetRound);

  els.instantToggle?.addEventListener("change", () => {
    if (state.round.checked) return;
    const items = getItems();
    if (els.instantToggle.checked) {
      items.forEach((item) => item.dataset.assignedId && assignItem(item, item.dataset.assignedId));
      renderStatusLine("即时判定已开启");
      return;
    }
    items.forEach((item) => {
      item.classList.remove("ok", "bad");
      const feedback = item.querySelector(".feedback");
      if (feedback) feedback.textContent = "";
    });
    renderStatusLine("即时判定已关闭");
  });

  els.resetProgressBtn?.addEventListener("click", () => {
    const ok = window.confirm("确定要重置进度吗？这会清空本机掌握度与统计。");
    if (!ok) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(RECENT_KEY);
    } catch (_e) {}
    progress = readProgress();
    renderLevel();
    if (els.learnPanel) els.learnPanel.textContent = "点击右侧“解释”按钮或在图鉴中选择一个谬误类型，这里会显示定义、识别信号与反制提问。";
    startRound(false);
  });

  // Init
  renderLevel();
  if (els.learnPanel) els.learnPanel.textContent = "点击右侧“解释”按钮或在图鉴中选择一个谬误类型，这里会显示定义、识别信号与反制提问。";
  startRound(false);
})();

