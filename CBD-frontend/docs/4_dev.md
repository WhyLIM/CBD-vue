# For Developers

CBD3 is an open-source project released under the MIT license.

This section provides technical information for developers who want to contribute to CBD3, extend its functionality, or build applications using the project.

## Technology Stack

- **Frontend**: Vue 3, Vite, Element Plus, ECharts, Cytoscape.js
- **Backend**: Node.js, Express 5, MySQL2
- **Database**: MySQL (remote), 12+ core tables, ~36.4M rows
- **State Management**: Pinia
- **Build Tools**: Vite, pnpm
- **Documentation**: VitePress

## Project Structure

```
CBD3-vue/
├── CBD-frontend/           # Frontend application
│   ├── docs/               # Help docs (VitePress, bilingual EN/ZH)
│   │   ├── .vitepress/     # VitePress config and theme
│   │   ├── zh/             # Chinese documentation
│   │   ├── *.md            # English documentation
│   │   └── index.md        # Docs homepage
│   ├── src/
│   │   ├── components/     # Vue components
│   │   │   ├── analysis/   # Single-cell analysis components (7 modules)
│   │   │   ├── clinical/   # Clinical analysis components (2)
│   │   │   ├── common/     # Common/shared components
│   │   │   └── explore/    # Explore components (UMAP, Network)
│   │   ├── views/          # Page-level view components
│   │   ├── services/       # API service layer
│   │   ├── stores/         # Pinia state stores
│   │   ├── utils/          # Utility functions
│   │   └── assets/         # Static assets (CSS, images)
│   ├── public/             # Public static assets
│   ├── package.json
│   └── vite.config.js
└── CBD-backend/            # Backend application
    ├── routes/             # API route modules
    │   ├── analysis.js     # Single-cell analysis endpoints
    │   ├── clinical.js     # Clinical data endpoints
    │   ├── scrna.js        # scRNA-seq data endpoints
    │   └── ...
    ├── utils/              # Utility functions
    ├── .env                # Environment variables (DB config, etc.)
    ├── server.js           # Express entry point
    └── package.json
```

## Database Tables

Key tables in the MySQL database:

| Table | Description |
|-------|-------------|
| `biomarker_main` | Core biomarker records |
| `scrna_gene_expr_summary` | Single-cell gene expression summary |
| `scrna_pseudotime_trajectory` | Pseudotime trajectory data |
| `scrna_pseudotime_gene_expr` | Pseudotime gene expression |
| `analysis_degs` | Differential expressed genes |
| `analysis_gene_diff_celltype` | DEGs by cell type |
| `analysis_gene_diff_TvsN` | DEGs tumor vs normal |
| `analysis_kegg` | KEGG pathway enrichment |
| `analysis_ridge` | Ridge ranking data |
| `analysis_network_prs` | Network sensitivity PRS |
| `analysis_roc_tn` | ROC analysis tumor vs normal |
| `analysis_roc_celltype` | ROC analysis by cell type |
| `analysis_biomk_cellchat` | Biomarker CellChat data |
| `analysis_cellchat` | CellChat interaction data |
| `clinical_immune` | Immune infiltration data |
| `clinical_survival` | Survival analysis data |

## Getting Help

- **Documentation**: Check the relevant sections in this help center
- **GitHub Issues**: Search existing issues before creating new ones

## Repository

For source code and contribution guidelines, see [the GitHub repository](https://github.com/WhyLIM/CBD-vue).
