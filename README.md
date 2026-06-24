# 一次 AI 提问之后，账单被转移给了谁？

这是一个滚动式数据新闻网页，主题是“从云端回答到电网、水源与地方社区，看见 AI 竞赛背后的基础设施代价”。作品不估算单次 AI 提问的资源消耗，而是使用公开可验证的数据，把数据中心作为观察 AI 基础设施扩张影响的窗口。

## 技术结构

- `index.html`：11 个滚动叙事章节、图表容器、数据来源与制作说明
- `style.css`：深色首页、浅色正文、scrollytelling 布局、响应式样式
- `main.js`：CSV 加载、Chart.js 图表、顶部进度导航、情景切换、滚动 reveal
- `vendor/chart.umd.min.js`：本地 Chart.js，保证 GitHub Pages 可离线部署

## 使用数据

- `data/global_energy.csv`：全球数据中心用电增长与 2035 年情景
- `data/regional_growth.csv`：2030 年前各地区新增数据中心用电需求
- `data/local_infrastructure.csv`：地方基础设施压力证据卡片
- `data/us_energy_scenarios.csv`：美国数据中心用电与总用电占比
- `data/water_footprint.csv`：美国数据中心直接耗水
- `data/hidden_costs.csv`：间接耗水与温室气体排放数字卡片
- `data/stakeholders.csv`：收益与成本承担关系矩阵
- `data/data_notes.md`：数据整理说明与待补充项

## 数据来源

1. International Energy Agency, *Energy and AI*  
   https://www.iea.org/reports/energy-and-ai
2. Lawrence Berkeley National Laboratory / U.S. Department of Energy, *2024 United States Data Center Energy Usage Report*  
   https://eta-publications.lbl.gov/sites/default/files/2024-12/lbnl-2024-united-states-data-center-energy-usage-report.pdf

## 口径说明

当前公开统计大多以“数据中心整体”为对象。数据中心负载包括 AI 训练、AI 推理、云计算、企业服务、存储和网络服务。因此：

`数据中心总用电 ≠ AI 单独用电`

本文使用数据中心作为观察 AI 基础设施扩张影响的窗口，不生成无法验证的单次 AI 查询耗电、耗水或碳排放估算。

## 图表与交互

- AI 请求路径图：支持鼠标悬停和键盘聚焦查看说明
- 全球数据中心用电增长：2024 至 2030
- 2035 年三种用电情景：阻力情景、高效率情景、起飞情景
- 地区新增用电需求：美国、中国、欧洲、日本
- 地方基础设施压力链条：电网接入、输电/变电扩容、用水安排、社区与政府协调
- 美国数据中心用电增长与 2028 预测区间
- 美国数据中心占总用电比例
- 美国数据中心直接耗水增长
- 隐藏账单数字卡片：间接耗水、温室气体排放
- 成本承担关系图：用户、科技公司、地方社区、电网、政府
- 每张图表均包含标题、单位、来源、图表说明和 ARIA 描述；页面底部统一保留完整数据表

## 本地运行

由于浏览器直接打开本地 HTML 时可能阻止 `fetch()` 读取 CSV，建议在项目目录运行本地服务器：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。
