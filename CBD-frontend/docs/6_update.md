# Update & TODO List

## Version History

### Version 3.1.0 (Latest)

- **Release Date**: 2026/09/20
- **Network Analysis major upgrade** (`/network`):
  - ID mapping report before building; unmatched names flagged
  - Full STRING species support (12,000+); file-upload input fixed
  - **Network Expansion**: add top-scoring first-shell partners (0-20 per protein); human networks use a bundled local STRING index (instant, offline-capable)
  - Visualization: Morandi color system with preset and fully custom palettes; evidence-channel edge coloring with legend; node size/color mapped to centrality metrics; live confidence edge filter; shortest-path highlighting; six layouts (adds cose-bilkent); gentle graph fade-in
  - Node dialog: functional annotations (STRING) and deep links into CBD biomarker entries; edge dialog: dominant evidence channel and supporting publications (Europe PMC)
  - Analysis tabs: Topology (with path finder), Enrichment (with FDR and gene counts), **Modules** (Louvain detection, isolation, module-level enrichment), **Proximity Test** (cohesion z-score / empirical p-value via degree-matched randomization on the local human index), **Compare** (two-set union network with membership coloring and Jaccard index)
  - Downloads: PNG/SVG/GraphML plus a full analysis bundle (edges TSV, enrichment TSV, module assignments, GraphML, JSON snapshot) generated from the exact on-screen state
  - Backend: new STRING proxy routes (resolve / expand / abstracts / annotations / species / proximity) and a dedicated rate limit; relaxed global API limit for STRING routes

### Version 3.0.0

- **Release Date**: 2025/12/12
- **Major Changes**:
  - Complete platform redesign with Vue 3 + Vite
  - Biomarker browsing and advanced multi-condition search
  - Gene Expression Atlas with interactive UMAP visualization (10,000 cells default)
  - Protein-protein interaction network explorer (Cytoscape.js)
  - Gene autocomplete with 300ms debounce across search fields
  - Bilingual help documentation (English/Chinese, VitePress)
  - Backend: Express 5 + MySQL2, 12+ database tables, ~36.4M rows

### Version 2.0.0

- Migration to Vue 3 framework
- Introduction of single-cell analysis module
- Database schema optimization

### Version 1.0.0 (2018)

- Basic biomarker database
- Simple search functionality

## Known Issues

### High Priority

- **Large Dataset Loading**: Performance may degrade when loading datasets with >100,000 cells
  - **Workaround**: UMAP defaults to 10,000 cells; use filters where available

### Medium Priority

- **Browser Compatibility**: Minor display issues in Safari
  - **Workaround**: Use Chrome or Firefox for optimal experience

## Roadmap

### Planned

- Single-cell analysis suite (DEGs, KEGG pathway, ridge ranking, trajectory, CellChat, network sensitivity, predictive ROC)
- Clinical analysis pages (Kaplan-Meier survival, immune infiltration)
- API documentation for programmatic access
- Expanded dataset coverage
- Performance optimizations for large-scale visualizations
- Mobile-responsive improvements
