const palette = {
  ink: "#081A2B",
  blue: "#3BA9FF",
  accent: "#B64A45",
  amber: "#B8872D",
  green: "#367B68",
  muted: "#6B7280",
  line: "#D5DCE4"
};

Chart.defaults.color = "#5d6470";
Chart.defaults.font.family = '"Noto Sans SC", "Microsoft YaHei", Arial, sans-serif';
Chart.defaults.plugins.tooltip.backgroundColor = "#081A2B";
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.legend.labels.boxWidth = 12;

const sources = {
  global: "data/global_energy.csv",
  regional: "data/regional_growth.csv",
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
  const thead = headers.map((header) => `<th scope="col">${header}</th>`).join("");
  const body = rows.map((row) => `<tr>${headers.map((header) => `<td>${row[header] || ""}</td>`).join("")}</tr>`).join("");
  return `<table><thead><tr>${thead}</tr></thead><tbody>${body}</tbody></table>`;
}

function fillTables() {
  document.getElementById("globalTable").innerHTML = makeTable(store.global.filter((row) => row.scenario === "base_case"));
  document.getElementById("scenarioTable").innerHTML = makeTable(store.global.filter((row) => row.year === "2035"));
  document.getElementById("regionalTable").innerHTML = makeTable(store.regional);
  document.getElementById("usTable").innerHTML = makeTable(store.us.filter((row) => row.electricity_twh));
  document.getElementById("shareTable").innerHTML = makeTable(store.us.filter((row) => row.share_us_electricity_percent));
  document.getElementById("waterTable").innerHTML = makeTable(store.water);
}

function commonOptions(yTitle) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: yTitle },
        grid: { color: "rgba(213, 220, 228, 0.72)" }
      },
      x: { grid: { display: false } }
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
        label: "全球数据中心用电量（TWh）",
        data: rows.map((row) => number(row.electricity_twh)),
        borderColor: palette.blue,
        backgroundColor: "rgba(59, 169, 255, 0.16)",
        pointBackgroundColor: palette.blue,
        pointRadius: 6,
        tension: 0.25,
        fill: true
      }]
    },
    options: commonOptions("TWh")
  });
}

function drawScenarioChart(active = "headwinds") {
  const rows = store.global.filter((row) => row.year === "2035");
  const colors = rows.map((row) => (row.scenario === active ? palette.blue : "#9CA3AF"));
  if (charts.scenario) {
    charts.scenario.data.datasets[0].backgroundColor = colors;
    charts.scenario.update();
    return;
  }
  charts.scenario = new Chart(document.getElementById("scenarioChart"), {
    type: "bar",
    data: {
      labels: rows.map((row) => row.scenario_label),
      datasets: [{
        label: "2035 年情景用电量（TWh）",
        data: rows.map((row) => number(row.electricity_twh)),
        backgroundColor: colors,
        borderRadius: 4
      }]
    },
    options: commonOptions("TWh")
  });
}

function drawRegionalChart() {
  charts.regional = new Chart(document.getElementById("regionalGrowthChart"), {
    type: "bar",
    data: {
      labels: store.regional.map((row) => row.region),
      datasets: [{
        label: "新增用电需求（TWh）",
        data: store.regional.map((row) => number(row.added_electricity_twh)),
        backgroundColor: [palette.blue, palette.accent, palette.amber, palette.green],
        borderRadius: 4
      }]
    },
    options: {
      ...commonOptions("TWh"),
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
        label: "美国数据中心用电量（TWh）",
        data: [...historical.map((row) => number(row.electricity_twh)), [number(low.electricity_twh), number(high.electricity_twh)]],
        backgroundColor: ["#8C8F95", "#8C8F95", palette.blue, palette.accent],
        borderRadius: 4
      }]
    },
    options: commonOptions("TWh")
  });

  charts.share = new Chart(document.getElementById("usShareChart"), {
    type: "bar",
    data: {
      labels: ["2023", "2028 预测区间"],
      datasets: [{
        label: "占美国总用电比例（%）",
        data: [4.4, [6.7, 12]],
        backgroundColor: [palette.blue, palette.accent],
        borderRadius: 4
      }]
    },
    options: commonOptions("%")
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
        label: "直接耗水（十亿升）",
        data: [...historical.map((row) => number(row.value_billion_liters)), [number(low.value_billion_liters), number(high.value_billion_liters)]],
        backgroundColor: [palette.green, palette.blue, palette.accent],
        borderRadius: 4
      }]
    },
    options: commonOptions("十亿升")
  });
}

function renderHiddenCosts() {
  const container = document.getElementById("hiddenCostCards");
  container.innerHTML = store.hidden.map((row) => `
    <article>
      <span>${row.label}</span>
      <strong>${row.value}</strong>
      <em>${row.unit === "billion_liters" ? "十亿升" : "十亿千克 CO₂e"}</em>
      <p>${row.note}</p>
      <small>来源：${row.source_title}</small>
    </article>
  `).join("");
}

function renderStakeholders() {
  const container = document.getElementById("stakeholderMap");
  container.innerHTML = store.stakeholders.map((row) => `
    <article class="${row.receives ? "gain" : "cost"}">
      <h3>${row.stakeholder}</h3>
      <p>${row.receives ? `获得：${row.receives}` : `承担：${row.bears}`}</p>
    </article>
  `).join("");
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

async function init() {
  try {
    const [global, regional, us, water, hidden, stakeholders] = await Promise.all([
      loadCSV(sources.global),
      loadCSV(sources.regional),
      loadCSV(sources.us),
      loadCSV(sources.water),
      loadCSV(sources.hidden),
      loadCSV(sources.stakeholders)
    ]);
    Object.assign(store, { global, regional, us, water, hidden, stakeholders });
    fillTables();
    drawGlobalChart();
    drawScenarioChart();
    drawRegionalChart();
    drawUSChart();
    drawWaterChart();
    renderHiddenCosts();
    renderStakeholders();
    bindScenarioButtons();
    initReveal();
  } catch (error) {
    document.querySelectorAll(".chart-card").forEach((card) => {
      card.insertAdjacentHTML("beforeend", `<p class="load-error">${error.message}。请通过本地服务器打开页面。</p>`);
    });
  }
}

init();
