# Update & TODO List

## Version History

### Version 3.0.0 (Latest)

- **Release Date**: 2025/12/12
- **Major Changes**:
  - Complete platform redesign with Vue 3 + Vite
  - Biomarker browsing and advanced multi-condition search
  - Gene Expression Atlas with interactive UMAP visualization (10,000 cells default)
  - Protein-protein interaction network explorer (Cytoscape.js)
  - Seven single-cell analysis modules:
    - DEGs (volcano plots, by cell type, tumor vs normal)
    - KEGG pathway enrichment (bubble charts)
    - Ridge ranking
    - Trajectory analysis (cell trajectory + interactive pseudotime)
    - CellChat cell communication (all interactions + biomarker-specific)
    - Network sensitivity (PRS analysis)
    - Predictive ability (ROC curves, tumor vs normal + by cell type)
  - Clinical analysis: Kaplan-Meier survival curves and immune infiltration heatmaps
  - Gene autocomplete with 300ms debounce across all analysis pages
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

- API documentation for programmatic access
- Expanded dataset coverage
- Performance optimizations for large-scale visualizations
- Mobile-responsive improvements
