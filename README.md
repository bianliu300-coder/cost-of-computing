# 算力的代价：AI 竞赛的暗面

这是一个数据新闻课程作业的静态网页项目，聚焦 AI 数据中心扩张带来的电力、水资源与碳排放压力。页面使用 HTML、CSS、JavaScript 和 Chart.js，图表数据来自 `data/` 目录下的 CSV 文件。

## 文件结构

- `index.html`：页面结构与正文
- `style.css`：数据新闻风格版式与响应式样式
- `main.js`：CSV 加载、解析与 Chart.js 图表绘制
- `vendor/chart.umd.min.js`：本地 Chart.js 4.4.7，避免 CDN 无法访问时图表失效
- `data/electricity_global.csv`：全球数据中心用电量
- `data/electricity_us.csv`：美国数据中心用电量
- `data/water_impact.csv`：美国数据中心现场用水量与待补充项

## 数据来源

1. International Energy Agency, *Energy and AI*, 2025  
   https://www.iea.org/reports/energy-and-ai
2. Lawrence Berkeley National Laboratory / U.S. Department of Energy, *2024 United States Data Center Energy Usage Report*, 2024  
   https://eta-publications.lbl.gov/sites/default/files/2024-12/lbnl-2024-united-states-data-center-energy-usage-report.pdf
3. Guidi et al., *Environmental Burden of United States Data Centers in the Artificial Intelligence Era*, 2024  
   https://arxiv.org/abs/2411.09786

## 字段说明

### `electricity_global.csv`

- `year`：年份
- `electricity_twh`：数据中心用电量，单位为 TWh
- `scenario`：情景类型，包括 `base_case`、`low_sensitivity`、`high_sensitivity`
- `scope`：统计范围
- `source_title`：来源名称
- `source_url`：来源链接
- `note`：口径说明

### `electricity_us.csv`

- `year`：年份
- `electricity_twh`：美国数据中心用电量，单位为 TWh
- `scenario`：历史估计、当前估计或预测情景
- `share_us_electricity_percent`：占美国总用电量比例；缺失处表示源报告摘要中未采用该比例展示
- `scope`：统计范围
- `source_title`：来源名称
- `source_url`：来源链接
- `note`：口径说明

### `water_impact.csv`

- `metric`：指标名称
- `year`：年份；无可靠来源时标注为 `待补充`
- `value_billion_liters`：现场用水量，单位为十亿升；无可靠来源时标注为 `待补充`
- `scenario`：估计值、预测值或不可用状态
- `scenario_label`：图表显示用中文标签
- `scope`：统计范围
- `source_title`：来源名称
- `source_url`：来源链接
- `note`：口径说明

## 数据清洗步骤

1. 从公开报告中摘录明确给出的 TWh、百分比和十亿升指标，只保留能追溯到来源的数字。
2. 将不同来源统一为图表可读单位：电力统一为 TWh，水量统一为十亿升。
3. 将预测值拆分为情景字段，例如低情景、高情景和基准情景，避免把区间误读为单一确定值。
4. 对无法从公开来源拆分的 AI-only 指标标注为 `待补充`，不进入图表计算。
5. 在 CSV 中保留 `source_title`、`source_url` 和 `note`，方便复核每个数据点的出处与口径。

## 本地运行

由于浏览器直接打开本地 HTML 时可能阻止 `fetch()` 读取 CSV，建议在项目目录运行本地服务器：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。
