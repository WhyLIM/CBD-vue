# 公共 API

CBD3 为本网站的全部数据提供只读 HTTP API。网页上的每一项功能——标志物记录、单细胞 UMAP 与基因表达、差异表达、ROC、细胞通讯、临床证据——都可以通过程序化方式查询。

## 基础地址

```
https://cbd.biomarkerdb.cn/api
```

下文示例均基于此地址，API 仅返回 JSON。

## 身份认证

轻度使用无需任何账号。程序化或批量访问请向维护者申请免费 API 密钥（见[引用与支持](/zh/5_cite)），并在请求头中携带：

```
X-API-Key: cbd_0123456789abcdef0123456789abcdef
```

密钥按个人/课题组签发，可随时吊销，自带独立限流额度，不会自动过期。

## 速率限制

| 客户端 | 限制 | 说明 |
|---|---|---|
| 匿名（按 IP） | 1000 次 / 15 分钟 | 与普通网站流量一致 |
| API 密钥（默认） | 6000 次 / 15 分钟 / 密钥 | 可按需上调 |

- 超出限制返回 **HTTP 429**，带 `Retry-After` 响应头；
- 重型端点——批量下载（`/download`）、数据提交（`/submission`）、PRS 即时计算（`/network/prs*`）与 STRING 代理（`/string`）——**不享受**密钥提权，始终按每 IP 限额计数。

## 响应结构

成功响应具有稳定的外层结构：

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalItems": 1284,
    "totalPages": 65
  }
}
```

错误响应返回相应 HTTP 状态码（400 参数错误、401 密钥无效、403 禁止访问、404 不存在、429 超出限流、500 服务器错误），响应体：

```json
{ "success": false, "error": "Invalid or revoked API key." }
```

## 端点参考

### 生物标志物

| 端点 | 说明 | 主要参数 |
|---|---|---|
| `GET /biomarkers` | 标志物分页列表 | `search`、`category`、`source`、`region`、`stage`、`sortBy`、`sortOrder`、`page`、`limit`（≤100） |
| `GET /biomarkers/{id}` | 按 id 获取完整记录 | — |
| `GET /biomarkers/filters/options` | 可用筛选项取值 | — |

### 搜索

| 端点 | 说明 | 主要参数 |
|---|---|---|
| `GET /search/quick` | 关键词搜索 | `q`、`page`、`limit` |
| `GET /search/suggestions` | 自动补全建议 | `q`、`type` |
| `POST /search/advanced` | 多条件搜索（JSON 请求体与网站高级搜索表单一致） | `string_name`（支持逗号分隔多基因）、`category`、`region`、`stage` 等 |

### 统计

| 端点 | 说明 |
|---|---|
| `GET /stats` | 数据库全库记录计数 |

### 单细胞（UMAP 与基因表达）

| 端点 | 说明 | 主要参数 |
|---|---|---|
| `GET /scrna/umap` | UMAP 散点数据 | `page`、`limit`（≤200000）、`subcluster`、`sample`、`patient`、`colorBy` |
| `GET /scrna/gene-expr` | 逐细胞表达，支持一个或多个基因（多基因按细胞返回平均表达） | `gene`（逗号分隔，≤50）、`limit` |
| `GET /scrna/gene-search` | 基因符号自动补全 | `q`、`limit` |
| `GET /scrna/metadata/filters` | 可用细胞簇 / 样本 / 患者取值 | — |

### 单细胞分析

| 端点 | 说明 | 主要参数 |
|---|---|---|
| `GET /analysis/degs` | 差异表达（原始队列） | `cell_type`、`gene`、`sort`、`page`、`limit` |
| `GET /analysis/degs/chart` | 火山图全量数据 | `cell_type` |
| `GET /analysis/gene-diff/celltype` · `/tvsn` | 按细胞类型 / 肿瘤vs正常差异表达 | `celltype`、`gene`（逗号分隔多基因）、`min_logfc`、`max_padj`、`sort`、`page`、`limit` |
| `GET /analysis/gene-diff/*/chart` | 上两者的全量火山数据 | `celltype` |
| `GET /analysis/kegg` | KEGG 通路结果 | `cell_type`、`page`、`limit` |
| `GET /analysis/ridge` | Ridge 排名 | `cell_type`、`gene`、`page`、`limit` |
| `GET /analysis/cellchat` | 精选细胞通讯互作 | `source`、`target`、`pathway_name`、`ligand`、`receptor`、`page`、`limit` |
| `GET /analysis/cellchat-raw` | CellChat 全量互作（含通路注释与证据来源） | `source`、`target`、`pathway_name`、`annotation`、`gene`（逗号分隔模糊匹配）、`min_prob`、`page`、`limit` |
| `GET /analysis/cellchat-raw/network` | 按 source-target 聚合的网络数据 | 同上筛选参数 |
| `GET /analysis/biomk-cellchat` | 双特异性标志基因互作 | `gene`、`biomark_as`（`ligand`/`receptor`）、`page`、`limit` |
| `GET /analysis/prs` | 网络敏感性（PRS） | `celltype`、`gene`、`page`、`limit` |
| `GET /analysis/roc/tn` · `/celltype` · `/chart` | 预测能力（ROC） | `celltype`、`gene`、`min_auc`、`sort`、`page`、`limit` |
| `GET /analysis/metadata/filters` | 一次获取全部筛选项 | — |

### 临床证据

| 端点 | 说明 | 主要参数 |
|---|---|---|
| `GET /clinical/diagnosis` | 诊断 AUC | `gene`、`label`、`page`、`limit` |
| `GET /clinical/survival` | 生存分析 | `gene`、`surv_type`、`page`、`limit` |
| `GET /clinical/immune` | 免疫浸润 | `gene`、`immune_cell`、`page`、`limit` |

## 调用示例

### curl

```bash
# 亚洲区域的蛋白标志物，每页 5 条
curl "https://cbd.biomarkerdb.cn/api/biomarkers?category=Protein&region=Asia&limit=5"

# 携带 API 密钥的同一请求（更高限流额度）
curl -H "X-API-Key: cbd_0123456789abcdef0123456789abcdef" \
     "https://cbd.biomarkerdb.cn/api/biomarkers?category=Protein&limit=100&page=2"

# 两个基因在单细胞 UMAP 中的平均表达
curl "https://cbd.biomarkerdb.cn/api/scrna/gene-expr?gene=TP53,KRAS&limit=20000"
```

### Python

```python
import requests

BASE = "https://cbd.biomarkerdb.cn/api"
HEADERS = {"X-API-Key": "cbd_0123456789abcdef0123456789abcdef"}

def get_all_biomarkers(category="Protein"):
    page, out = 1, []
    while True:
        r = requests.get(f"{BASE}/biomarkers", headers=HEADERS,
                         params={"category": category, "page": page, "limit": 100}).json()
        out.extend(r["data"])
        if page >= r["pagination"]["totalPages"]:
            return out
        page += 1

records = get_all_biomarkers()
print(len(records), "records")
```

### JavaScript

```js
const res = await fetch("https://cbd.biomarkerdb.cn/api/analysis/cellchat-raw?pathway_name=TGFb&limit=50", {
  headers: { "X-API-Key": "cbd_0123456789abcdef0123456789abcdef" }
});
const { data } = await res.json();
```

## AI Agent 访问（WebMCP）

CBD3 实现了 [WebMCP](https://github.com/webmachinelearning/webmcp) 提案（W3C Web Machine Learning Community Group）：在支持该规范的浏览器或 Agent 扩展中打开本站时，站点会注册以下结构化工具，AI Agent 可以直接调用它们查询数据库，而无需解析 HTML。

| 工具 | 说明 |
|---|---|
| `get-database-stats` | 数据库全库记录计数 |
| `search-biomarkers` | 筛选 / 搜索标志物记录 |
| `get-biomarker-detail` | 按 id 获取完整标志物记录 |
| `quick-search` | 全库关键词搜索 |
| `list-filter-options` | 可用细胞类型 / 样本 / 患者取值 |
| `search-genes` | 基因符号自动补全（单细胞数据集） |
| `get-gene-expression` | 一个或多个基因的逐细胞表达及汇总统计 |
| `get-deg-analysis` | 差异表达（原始队列 / 按细胞类型 / 肿瘤vs正常） |
| `get-cellchat-interactions` | 细胞通讯（含通路注释与证据来源） |
| `get-roc-predictive-ability` | ROC 预测能力（肿瘤vs正常 / 细胞类型） |
| `get-clinical-evidence` | 诊断 / 生存 / 免疫浸润证据 |

- 工具调用的是与网站相同的只读 API，受相同的每 IP 限流约束；
- 能力探测：按 WebMCP 草案通过 `document.modelContext` 判断，不支持的浏览器行为完全不变；
- Agent 通过 `document.modelContext.getTools()` / `executeTool()`（浏览器内置或实现该提案的扩展）消费这些工具。

## 合理使用约定

- API 提供已发表分析结果的**只读**访问；批量导出请使用[数据下载](/zh/download)页面，而不是逐页遍历 API；
- 请尽量缓存响应、保持适中的请求频率——数据库运行在与网站共享的普通配置服务器上；
- 使用本数据库数据的成果请引用 CBD3（见[引用与支持](/zh/5_cite)）。
