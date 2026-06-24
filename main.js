const palette = {
  ink: "#081A2B",
  blue: "#3BA9FF",
  blueDark: "#1D4ED8",
  blueSoft: "#93C5FD",
  water: "#14B8A6",
  waterDark: "#0F766E",
  infra: "#8B5CF6",
  orange: "#F97316",
  green: "#22C55E",
  slate: "#94A3B8",
  muted: "#6B7280",
  line: "#D5DCE4"
};

const scenarioMeta = {
  headwinds: {
    label: "阻力情景",
    color: "#94A3B8",
    description: "阻力情景对应约 700 TWh，意味着需求扩张受到效率、成本或接入瓶颈约束，电网新增压力相对较低。"
  },
  high_efficiency: {
    label: "高效率情景",
    color: "#22C55E",
    description: "高效率情景对应约 970 TWh，强调效率提升可以缓冲一部分用电增长，但数据中心电力需求仍显著高于 2024 年。"
  },
  lift_off: {
    label: "起飞情景",
    color: "#F97316",
    description: "起飞情景对应约 1700+ TWh，表示需求快速扩张时，数据中心用电可能把更大压力推向电网和地方基础设施。"
  }
};

const stakeholderDetails = {
  用户: "获得便利与效率：更快的回答、更低的使用门槛和更高的工作效率。",
  科技公司: "获得增长与商业收益：更多用户、更高算力需求和更强平台黏性。",
  电网: "承担新增负荷与调度压力：需要应对更高、更集中的数据中心用电需求。",
  地方社区: "面对用地、用水和环境压力：数据中心选址会进入地方公共资源分配。",
  政府: "承担规划、审批和公共资源协调：需要在产业发展、电价、供电和环保之间做平衡。"
};

const tableHeaderLabels = {
  year: "年份",
  scope: "口径",
  electricity_twh: "用电量（TWh）",
  scenario: "情景代码",
  scenario_label: "情景",
  source_title: "来源",
  source_url: "来源链接",
  note: "说明",
  region: "地区",
  added_electricity_twh: "新增用电需求（TWh）",
  period: "时期",
  evidence: "证据",
  value_text: "数值",
  unit: "单位",
  share_us_electricity_percent: "占比（%）",
  metric: "指标",
  mode: "类型",
  value_billion_liters: "数值（十亿升）",
  label: "标签",
  value: "数值",
  stakeholder: "主体",
  receives: "获得",
  bears: "承担"
};

const tableValueLabels = {
  global_data_centers: "全球数据中心",
  us_data_centers: "美国数据中心",
  us_hyperscale_data_centers: "美国超大规模数据中心",
  base_case: "基准情景",
  headwinds: "阻力情景",
  high_efficiency: "高效率情景",
  lift_off: "起飞情景",
  historical: "历史估计",
  current: "当前估计",
  low_projection: "低情景预测",
  high_projection: "高情景预测",
  direct: "直接耗水",
  by_2030: "2030 年前",
  direct_water_consumption: "直接耗水",
  "2024 actual or estimate": "2024 年实际或估计",
  "2030 base case": "2030 年基准情景",
  "IEA Energy and AI": "IEA《Energy and AI》",
  "LBNL Report": "LBNL 报告",
  "LBNL/DOE 2024 United States Data Center Energy Usage Report": "LBNL/DOE《2024 United States Data Center Energy Usage Report》",
  "DOE/LBNL 2024 United States Data Center Energy Usage Report": "DOE/LBNL《2024 United States Data Center Energy Usage Report》",
  "billion_liters": "十亿升",
  "billion_kg_co2e": "十亿千克 CO₂e",
  indirect_water: "间接耗水",
  ghg_emissions: "温室气体排放",
  "Narrative synthesis": "叙事整理",
  "Qualitative matrix based on article structure; no numeric value.": "基于文章结构整理的定性关系，不包含统计数值。"
};

const globalValueLabelsPlugin = {
  id: "globalValueLabels",
  afterDatasetsDraw(chart) {
    if (chart.canvas.id !== "globalElectricityChart") return;
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    ctx.save();
    ctx.font = "700 13px Noto Sans SC, Microsoft YaHei, Arial";
    ctx.fillStyle = "#081A2B";
    ctx.textAlign = "center";
    meta.data.forEach((point, index) => {
      const value = chart.data.datasets[0].data[index];
      const label = `${chart.data.labels[index]} 年 ${value} TWh`;
      const y = point.y - 14;
      ctx.fillText(label, point.x, Math.max(18, y));
    });
    ctx.restore();
  }
};

Chart.register(globalValueLabelsPlugin);

Chart.defaults.color = "#5d6470";
Chart.defaults.font.family = '"Noto Sans SC", "Microsoft YaHei", Arial, sans-serif';
Chart.defaults.plugins.tooltip.backgroundColor = "#081A2B";
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.legend.labels.boxWidth = 12;

const sources = {
  global: "data/global_energy.csv",
  regional: "data/regional_growth.csv",
  local: "data/local_infrastructure.csv",
  us: "data/us_energy_scenarios.csv",
  water: "data/water_footprint.csv",
  hidden: "data/hidden_costs.csv",
  stakeholders: "data/stakeholders.csv"
};

const store = {};
const charts = {};

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);

  const headers = rows.shift();
  return rows.map((values) =>
    headers.reduce((record, header, index) => {
      record[header.trim()] = (values[index] || "").trim();
      return record;
    }, {})
  );
}

async function loadCSV(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`无法加载 ${path}`);
  return parseCSV(await response.text());
}

function number(value) {
  return Number.parseFloat(value);
}

function makeTable(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const thead = headers.map((header) => `<th scope="col">${tableHeaderLabels[header] || header}</th>`).join("");
  const body = rows.map((row) => `<tr>${headers.map((header) => `<td>${formatTableCell(row[header] || "")}</td>`).join("")}</tr>`).join("");
  return `<table><thead><tr>${thead}</tr></thead><tbody>${body}</tbody></table>`;
}

function formatTableCell(value) {
  if (/^https?:\/\//.test(value)) return `<a href="${value}" target="_blank" rel="noreferrer">查看来源</a>`;
  if (tableValueLabels[value]) return tableValueLabels[value];
  return value
    .replace(/Global data-centre electricity consumption in 2024\./g, "2024 年全球数据中心用电量。")
    .replace(/Global data-centre electricity consumption under IEA base case in 2030\./g, "IEA 基准情景下 2030 年全球数据中心用电量。")
    .replace(/2035 scenario value provided for the interactive future scenarios chart\./g, "2035 年交互情景图使用的情景数值。")
    .replace(/2035 scenario value is 1700\+ TWh; chart uses 1700 as the lower bound and labels it as 1700\+\./g, "2035 年起飞情景为 1700+ TWh；图表以 1700 作为下界，并保留 1700+ 口径。")
    .replace(/Additional data-centre electricity demand before 2030\./g, "2030 年前新增数据中心用电需求。")
    .replace(/Historical estimate reported in the LBNL\/DOE study\./g, "LBNL/DOE 报告中的历史估计。")
    .replace(/Estimated data-centre electricity use and share of total US electricity consumption in 2023\./g, "2023 年美国数据中心用电量及其占全社会用电比例。")
    .replace(/Low projection for 2028\./g, "2028 年低情景预测。")
    .replace(/High projection for 2028\./g, "2028 年高情景预测。")
    .replace(/Direct water consumption by US data centers, expressed as billion litres\./g, "美国数据中心直接耗水，单位为十亿升。")
    .replace(/Projected direct water consumption for hyperscale data centers, lower bound, expressed as billion litres\./g, "超大规模数据中心直接耗水低值预测，单位为十亿升。")
    .replace(/Projected direct water consumption for hyperscale data centers, upper bound, expressed as billion litres\./g, "超大规模数据中心直接耗水高值预测，单位为十亿升。");
}

function fillTables() {
  document.getElementById("globalTable").innerHTML = makeTable(store.global.filter((row) => row.scenario === "base_case"));
  document.getElementById("scenarioTable").innerHTML = makeTable(store.global.filter((row) => row.year === "2035"));
  document.getElementById("regionalTable").innerHTML = makeTable(store.regional);
  document.getElementById("localTable").innerHTML = makeTable(store.local);
  document.getElementById("usTable").innerHTML = makeTable(store.us.filter((row) => row.electricity_twh));
  document.getElementById("shareTable").innerHTML = makeTable(store.us.filter((row) => row.share_us_electricity_percent));
  document.getElementById("waterTable").innerHTML = makeTable(store.water);
  document.getElementById("hiddenTable").innerHTML = makeTable(store.hidden);
  document.getElementById("stakeholderTable").innerHTML = makeTable(store.stakeholders);
}

function formatValue(value, unit) {
  if (Array.isArray(value)) return `${value[0]}-${value[1]} ${unit}`;
  return `${value} ${unit}`;
}

function commonOptions(yTitle, unit = yTitle) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label(context) {
            return `${context.dataset.label}：${formatValue(context.raw, unit)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: yTitle },
        grid: { color: "rgba(213, 220, 228, 0.72)" }
      },
      x: {
        ticks: { maxRotation: 0, autoSkip: false },
        grid: { display: false }
      }
    }
  };
}

function drawGlobalChart() {
  const rows = store.global.filter((row) => row.scenario === "base_case");
  charts.global = new Chart(document.getElementById("globalElectricityChart"), {
    type: "line",
    data: {
      labels: rows.map((row) => row.year),
      datasets: [{
        label: "全球数据中心用电量",
        data: rows.map((row) => number(row.electricity_twh)),
        borderColor: palette.blue,
        backgroundColor: "rgba(59, 169, 255, 0.16)",
        pointBackgroundColor: palette.blueDark,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        tension: 0.25,
        fill: true
      }]
    },
    options: {
      ...commonOptions("TWh（太瓦时）", "TWh"),
      layout: { padding: { top: 28 } }
    }
  });
}

function updateScenarioInsight(active) {
  const row = store.global.find((item) => item.year === "2035" && item.scenario === active);
  const target = document.getElementById("scenarioInsight");
  if (!row || !target) return;
  const suffix = active === "lift_off" ? "+" : "";
  target.innerHTML = `
    <strong>${scenarioMeta[active].label}：约 ${row.electricity_twh}${suffix} TWh</strong>
    <span>${scenarioMeta[active].description}</span>
  `;
}

function drawScenarioChart(active = "high_efficiency") {
  const rows = store.global.filter((row) => row.year === "2035");
  const colors = rows.map((row) => scenarioMeta[row.scenario].color);
  const borders = rows.map((row) => (row.scenario === active ? palette.ink : "rgba(8, 26, 43, 0.14)"));
  const borderWidths = rows.map((row) => (row.scenario === active ? 3 : 1));

  updateScenarioInsight(active);
  if (charts.scenario) {
    charts.scenario.data.datasets[0].borderColor = borders;
    charts.scenario.data.datasets[0].borderWidth = borderWidths;
    charts.scenario.update();
    return;
  }
  charts.scenario = new Chart(document.getElementById("scenarioChart"), {
    type: "bar",
    data: {
      labels: rows.map((row) => row.scenario_label),
      datasets: [{
        label: "2035 年数据中心用电量",
        data: rows.map((row) => number(row.electricity_twh)),
        backgroundColor: colors,
        borderColor: borders,
        borderWidth: borderWidths,
        borderRadius: 4
      }]
    },
    options: {
      ...commonOptions("TWh（太瓦时）", "TWh"),
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              const row = rows[context.dataIndex];
              const suffix = row.scenario === "lift_off" ? "+" : "";
              return `${row.scenario_label}：约 ${row.electricity_twh}${suffix} TWh`;
            }
          }
        }
      }
    }
  });
}

function drawRegionalChart() {
  charts.regional = new Chart(document.getElementById("regionalGrowthChart"), {
    type: "bar",
    data: {
      labels: store.regional.map((row) => row.region),
      datasets: [{
        label: "新增用电需求",
        data: store.regional.map((row) => number(row.added_electricity_twh)),
        backgroundColor: ["#1D4ED8", "#3BA9FF", "#93C5FD", "#BFDBFE"],
        borderRadius: 4
      }]
    },
    options: {
      ...commonOptions("TWh（太瓦时）", "TWh"),
      indexAxis: "y"
    }
  });
}

function drawUSChart() {
  const rows = store.us;
  const historical = rows.filter((row) => row.scenario === "historical" || row.scenario === "current");
  const low = rows.find((row) => row.scenario === "low_projection");
  const high = rows.find((row) => row.scenario === "high_projection");
  charts.us = new Chart(document.getElementById("usElectricityChart"), {
    type: "bar",
    data: {
      labels: [...historical.map((row) => row.year), "2028 预测区间"],
      datasets: [{
        label: "美国数据中心用电量",
        data: [...historical.map((row) => number(row.electricity_twh)), [number(low.electricity_twh), number(high.electricity_twh)]],
        backgroundColor: ["#93C5FD", "#60A5FA", "#1D4ED8", "#8B5CF6"],
        borderRadius: 4
      }]
    },
    options: commonOptions("TWh（太瓦时）", "TWh")
  });

  charts.share = new Chart(document.getElementById("usShareChart"), {
    type: "bar",
    data: {
      labels: ["2023", "2028 预测区间"],
      datasets: [{
        label: "占美国总用电比例",
        data: [4.4, [6.7, 12]],
        backgroundColor: [palette.blue, palette.infra],
        borderRadius: 4
      }]
    },
    options: commonOptions("%", "%")
  });
}

function drawWaterChart() {
  const rows = store.water;
  const low = rows.find((row) => row.scenario === "low_projection");
  const high = rows.find((row) => row.scenario === "high_projection");
  const historical = rows.filter((row) => row.scenario === "historical" || row.scenario === "current");
  charts.water = new Chart(document.getElementById("waterChart"), {
    type: "bar",
    data: {
      labels: [...historical.map((row) => row.year), "2028 超大规模区间"],
      datasets: [{
        label: "直接耗水",
        data: [...historical.map((row) => number(row.value_billion_liters)), [number(low.value_billion_liters), number(high.value_billion_liters)]],
        backgroundColor: ["#99F6E4", palette.water, palette.waterDark],
        borderRadius: 4
      }]
    },
    options: commonOptions("十亿升", "十亿升")
  });
}

function renderLocalEvidence() {
  const container = document.getElementById("localEvidenceCards");
  const listItems = (text) => text.split("；").map((item) => `<li>${item}</li>`).join("");
  container.innerHTML = store.local.map((row) => `
    <article tabindex="0">
      <small>${row.evidence}</small>
      <ul>${listItems(row.value_text)}</ul>
      <p>${row.note}</p>
    </article>
  `).join("");
}

function renderHiddenCosts() {
  const container = document.getElementById("hiddenCostCards");
  container.innerHTML = store.hidden.map((row) => {
    const displayValue = row.unit === "billion_kg_co2e" ? "610 亿千克 CO₂e" : "8000 亿升";
    return `
      <article>
        <span>${row.label}</span>
        <strong>${displayValue}</strong>
        <em>按报告单位换算显示</em>
        <p>${row.note}</p>
        <small>来源：${row.source_title}</small>
      </article>
    `;
  }).join("");
}

function renderStakeholders() {
  const container = document.getElementById("stakeholderMap");
  container.innerHTML = store.stakeholders.map((row) => {
    const label = row.receives ? `获得：${row.receives}` : `承担：${row.bears}`;
    return `
      <article class="${row.receives ? "gain" : "cost"}" tabindex="0">
        <h3>${row.stakeholder}</h3>
        <p>${label}</p>
        <small>${stakeholderDetails[row.stakeholder]}</small>
      </article>
    `;
  }).join("");
}

function bindScenarioButtons() {
  document.querySelectorAll("[data-scenario]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-scenario]").forEach((item) => item.classList.toggle("is-active", item === button));
      drawScenarioChart(button.dataset.scenario);
    });
  });
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.18 });
  document.querySelectorAll(".scrolly-section, .chart-card").forEach((item) => observer.observe(item));
}

function initProgressNav() {
  const links = new Map([...document.querySelectorAll("[data-progress-link]")].map((link) => [link.dataset.progressLink, link]));
  const sections = document.querySelectorAll("[data-progress-section]");
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const key = visible.target.dataset.progressSection;
    links.forEach((link, linkKey) => link.classList.toggle("is-active", linkKey === key));
  }, { rootMargin: "-28% 0px -55% 0px", threshold: [0.12, 0.35, 0.65] });
  sections.forEach((section) => observer.observe(section));
}

async function init() {
  try {
    const [global, regional, local, us, water, hidden, stakeholders] = await Promise.all([
      loadCSV(sources.global),
      loadCSV(sources.regional),
      loadCSV(sources.local),
      loadCSV(sources.us),
      loadCSV(sources.water),
      loadCSV(sources.hidden),
      loadCSV(sources.stakeholders)
    ]);
    Object.assign(store, { global, regional, local, us, water, hidden, stakeholders });
    fillTables();
    drawGlobalChart();
    drawScenarioChart("high_efficiency");
    drawRegionalChart();
    drawUSChart();
    drawWaterChart();
    renderLocalEvidence();
    renderHiddenCosts();
    renderStakeholders();
    bindScenarioButtons();
    initReveal();
    initProgressNav();
  } catch (error) {
    document.querySelectorAll(".chart-card, .evidence-grid, .large-number-grid, .stakeholder-map").forEach((card) => {
      card.insertAdjacentHTML("beforeend", `<p class="load-error">${error.message}。请通过本地服务器打开页面。</p>`);
    });
  }
}

init();
