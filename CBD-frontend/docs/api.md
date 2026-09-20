# Public API

CBD3 provides a read-only HTTP API over the same data that powers this website. Every feature you see in the web UI — biomarker records, single-cell UMAP and gene expression, differential expression, ROC, CellChat, clinical evidence — can be queried programmatically.

## Base URL

```
https://cbd.biomarkerdb.cn/api
```

All examples below use this base. The API returns JSON only.

## Authentication

The API is open for light use without any account. For programmatic or batch access, request a free API key from the maintainers (see [Citation & Support](/5_cite)) and send it in the `X-API-Key` header:

```
X-API-Key: cbd_0123456789abcdef0123456789abcdef
```

Keys are issued per person/lab, can be revoked, and carry their own rate limit. Keys never expire automatically.

## Rate limits

| Client | Limit | Notes |
|---|---|---|
| Anonymous (per IP) | 1000 requests / 15 min | Applies to normal website traffic |
| API key (default) | 6000 requests / 15 min per key | Adjustable per key on request |

- Exceeding the limit returns **HTTP 429** with a `Retry-After` header.
- Heavy endpoints — bulk downloads (`/download`), data submission (`/submission`), on-the-fly PRS computation (`/network/prs*`) and the STRING proxy (`/string`) — are **not** available with elevated key limits; they always count against the per-IP limit.

## Response envelope

Successful responses share a stable envelope:

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

Errors return the relevant HTTP status (400 invalid parameters, 401 invalid API key, 403 forbidden, 404 not found, 429 rate limited, 500 server error) with a JSON body:

```json
{ "success": false, "error": "Invalid or revoked API key." }
```

## Endpoint reference

### Biomarkers

| Endpoint | Description | Key parameters |
|---|---|---|
| `GET /biomarkers` | Paged biomarker list | `search`, `category`, `source`, `region`, `stage`, `sortBy`, `sortOrder`, `page`, `limit` (≤100) |
| `GET /biomarkers/{id}` | Full record by id | — |
| `GET /biomarkers/filters/options` | Allowed filter values | — |

### Search

| Endpoint | Description | Key parameters |
|---|---|---|
| `GET /search/quick` | Keyword search across records | `q`, `page`, `limit` |
| `GET /search/suggestions` | Autocomplete suggestions | `q`, `type` |
| `POST /search/advanced` | Multi-condition search (JSON body mirrors the Advanced Search form) | `string_name`, `category`, `region`, `stage`, ... |

### Statistics

| Endpoint | Description |
|---|---|
| `GET /stats` | Database-wide record counts |

### Single-cell (UMAP & gene expression)

| Endpoint | Description | Key parameters |
|---|---|---|
| `GET /scrna/umap` | UMAP scatter data | `page`, `limit` (≤200000), `subcluster`, `sample`, `patient`, `colorBy` |
| `GET /scrna/gene-expr` | Per-cell expression, one or more genes (multi-gene returns the per-cell mean) | `gene` (comma separated, ≤50), `limit` |
| `GET /scrna/gene-search` | Gene symbol autocomplete | `q`, `limit` |
| `GET /scrna/metadata/filters` | Allowed cell cluster / sample / patient values | — |

### Single-cell analyses

| Endpoint | Description | Key parameters |
|---|---|---|
| `GET /analysis/degs` | DEGs (original cohort) | `cell_type`, `gene`, `sort`, `page`, `limit` |
| `GET /analysis/degs/chart` | Full volcano data | `cell_type` |
| `GET /analysis/gene-diff/celltype` · `/tvsn` | Differential expression by celltype / Tumor-vs-Normal | `celltype`, `gene` (comma separated multi-gene), `min_logfc`, `max_padj`, `sort`, `page`, `limit` |
| `GET /analysis/gene-diff/*/chart` | Full volcano data for the above | `celltype` |
| `GET /analysis/kegg` | KEGG pathway results | `cell_type`, `page`, `limit` |
| `GET /analysis/ridge` | Ridge ranking | `cell_type`, `gene`, `page`, `limit` |
| `GET /analysis/cellchat` | Curated cell-cell interactions | `source`, `target`, `pathway_name`, `ligand`, `receptor`, `page`, `limit` |
| `GET /analysis/cellchat-raw` | Complete CellChat interactions with annotation & evidence | `source`, `target`, `pathway_name`, `annotation`, `gene` (comma separated fuzzy match), `min_prob`, `page`, `limit` |
| `GET /analysis/cellchat-raw/network` | Aggregated source→target network | same filters as above |
| `GET /analysis/biomk-cellchat` | Dual-specific biomarker interactions | `gene`, `biomark_as` (`ligand`/`receptor`), `page`, `limit` |
| `GET /analysis/prs` | Network sensitivity (PRS) | `celltype`, `gene`, `page`, `limit` |
| `GET /analysis/roc/tn` · `/celltype` · `/chart` | Predictive ability (ROC) | `celltype`, `gene`, `min_auc`, `sort`, `page`, `limit` |
| `GET /analysis/metadata/filters` | All filter options in one call | — |

### Clinical evidence

| Endpoint | Description | Key parameters |
|---|---|---|
| `GET /clinical/diagnosis` | Diagnostic AUC | `gene`, `label`, `page`, `limit` |
| `GET /clinical/survival` | Survival analysis | `gene`, `surv_type`, `page`, `limit` |
| `GET /clinical/immune` | Immune infiltration | `gene`, `immune_cell`, `page`, `limit` |

## Examples

### curl

```bash
# List protein biomarkers in Asia, 5 per page
curl "https://cbd.biomarkerdb.cn/api/biomarkers?category=Protein&region=Asia&limit=5"

# Same request with an API key (higher rate limit)
curl -H "X-API-Key: cbd_0123456789abcdef0123456789abcdef" \
     "https://cbd.biomarkerdb.cn/api/biomarkers?category=Protein&limit=100&page=2"

# Mean expression of two genes across the single-cell UMAP
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

## Fair-use terms

- The API provides **read-only** access to published analysis results; keep bulk exports to the [Download](/download) page instead of paginating through the API.
- Please cache responses where possible and keep request rates moderate — the database runs on modest hardware shared with the website.
- Cite CBD3 in any work that uses the data (see [Citation & Support](/5_cite)).
