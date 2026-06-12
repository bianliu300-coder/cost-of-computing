const chartDefaults = {
  color: "#5d6470",
  borderColor: "#d6cdbd",
  font: {
    family: '"Noto Sans SC", "Microsoft YaHei", Arial, sans-serif',
    size: 13
  }
};

Chart.defaults.color = chartDefaults.color;
Chart.defaults.font = chartDefaults.font;
Chart.defaults.plugins.legend.labels.boxWidth = 12;
Chart.defaults.plugins.tooltip.backgroundColor = "#191b1f";
Chart.defaults.plugins.tooltip.padding = 12;

const sources = {
  global: "data/electricity_global.csv",
  us: "data/electricity_us.csv",
  water: "data/water_impact.csv"
};

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

function sourceFooter(items) {
  const titles = [...new Set(items.map((item) => item.source_title).filter(Boolean))];
  return titles.length ? `来源：${titles.join("；")}` : "";
}

function makeGlobalChart(rows) {
  const base = rows.filter((row) => row.scenario === "base_case");
  const range2035 = rows.filter((row) => row.year === "2035" && row.scenario !== "base_case");
  const labels = base.map((row) => row.year);

  new Chart(document.getElementById("globalElectricityChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "基准情景用电量（TWh）",
          data: base.map((row) => number(row.electricity_twh)),
          borderColor: "#b83b36",
          backgroundColor: "rgba(184, 59, 54, 0.14)",
          pointBackgroundColor: "#b83b36",
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.28,
          fill: true
        },
        {
          label: "2035 敏感性低值（TWh）",
          data: labels.map((year) => (year === "2035" ? number(range2035.find((row) => row.scenario === "low_sensitivity").electricity_twh) : null)),
          borderColor: "#2f6f9f",
          backgroundColor: "#2f6f9f",
          pointStyle: "rectRot",
          pointRadius: 7,
          showLine: false
        },
        {
          label: "2035 敏感性高值（TWh）",
          data: labels.map((year) => (year === "2035" ? number(range2035.find((row) => row.scenario === "high_sensitivity").electricity_twh) : null)),
          borderColor: "#cc8b2c",
          backgroundColor: "#cc8b2c",
          pointStyle: "rectRot",
          pointRadius: 7,
          showLine: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        subtitle: {
          display: true,
          text: sourceFooter(rows),
          align: "start",
          padding: { bottom: 14 }
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.dataset.label}：${context.raw} TWh`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "TWh" },
          grid: { color: "rgba(214, 205, 189, 0.72)" }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

function makeUSElectricityChart(rows) {
  const labels = ["2014", "2018", "2023", "2028 低情景", "2028 高情景"];
  const lookup = new Map(rows.map((row) => [`${row.year}-${row.scenario}`, row]));
  const values = [
    lookup.get("2014-historical_estimate"),
    lookup.get("2018-historical_estimate"),
    lookup.get("2023-current_estimate"),
    lookup.get("2028-low_projection"),
    lookup.get("2028-high_projection")
  ].map((row) => number(row.electricity_twh));

  new Chart(document.getElementById("usElectricityChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "美国数据中心用电量（TWh）",
          data: values,
          backgroundColor: ["#8c8f95", "#8c8f95", "#b83b36", "#cc8b2c", "#2f6f9f"],
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        subtitle: {
          display: true,
          text: sourceFooter(rows),
          align: "start",
          padding: { bottom: 14 }
        },
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterLabel(context) {
              const row = rows.find((item) => number(item.electricity_twh) === context.raw);
              return row && row.share_us_electricity_percent
                ? `占全美用电：${row.share_us_electricity_percent}%`
                : "";
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "TWh" },
          grid: { color: "rgba(214, 205, 189, 0.72)" }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

function makeWaterChart(rows) {
  const chartRows = rows.filter((row) => row.metric === "onsite_water_consumption");
  const labels = chartRows.map((row) => (row.scenario.includes("projection") ? `${row.year} ${row.scenario_label}` : row.year));

  new Chart(document.getElementById("waterChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "现场用水量（十亿升）",
          data: chartRows.map((row) => number(row.value_billion_liters)),
          backgroundColor: ["#427d5b", "#cc8b2c", "#2f6f9f"],
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        subtitle: {
          display: true,
          text: sourceFooter(chartRows),
          align: "start",
          padding: { bottom: 14 }
        },
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.raw} 十亿升`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "十亿升" },
          grid: { color: "rgba(214, 205, 189, 0.72)" }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

async function init() {
  try {
    const [globalRows, usRows, waterRows] = await Promise.all([
      loadCSV(sources.global),
      loadCSV(sources.us),
      loadCSV(sources.water)
    ]);

    makeGlobalChart(globalRows);
    makeUSElectricityChart(usRows);
    makeWaterChart(waterRows);
  } catch (error) {
    document.querySelectorAll(".chart-frame").forEach((frame) => {
      frame.innerHTML = `<p class="load-error">${error.message}。请通过本地服务器打开页面，例如 python -m http.server。</p>`;
    });
  }
}

init();
