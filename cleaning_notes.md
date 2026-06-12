# 数据整理说明

本次整理没有覆盖原始数据文件，原有 `data/electricity_global.csv`、`data/electricity_us.csv` 和 `data/water_impact.csv` 保持不变。根据用户提供的数据，另生成 3 个新文件：

- `data/electricity_global_provided.csv`
- `data/electricity_us_provided.csv`
- `data/water_reference_provided.csv`

## 整理步骤

1. 将用户粘贴在一起的三段数据拆分为三个独立表格：全球数据中心用电、美国数据中心用电、水资源参考指标。
2. 保留英文表头；电力数据继续使用 `value_twh` 表示单位为 TWh。
3. 对水资源数据保留 `unit` 字段，将 `million gallons per day`、`people` 和 `liters per kWh` 单独记录。
4. 数字字段只保留数字，不在数值中写单位。例如 `5`、`10000`、`1.9`。
5. 保留 `source` 字段中的来源名称，包括 `IEA`、`LBNL` 和 `EESI`。
6. `note` 字段使用中文说明，沿用用户提供的解释文本。
7. 对美国 2014 年 `share_percent` 缺失值保留为空，不自行推算或补充。

## 字段口径

### `electricity_global_provided.csv`

- `year`：年份
- `scope`：统计范围
- `value_twh`：用电量，单位为 TWh
- `scenario`：数据类型或预测情景
- `source`：来源名称
- `note`：中文说明

### `electricity_us_provided.csv`

- `year`：年份
- `scope`：统计范围
- `value_twh`：用电量，单位为 TWh
- `share_percent`：占美国总用电比例，单位为 %
- `scenario`：历史数据或预测情景
- `source`：来源名称
- `note`：中文说明

### `water_reference_provided.csv`

- `indicator`：指标名称
- `value`：指标数值
- `unit`：单位
- `scope`：统计范围
- `source`：来源名称
- `note`：中文说明
