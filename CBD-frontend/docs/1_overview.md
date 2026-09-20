# Introduction & Overview

## Introduction

CBD3 (Colorectal Cancer Biomarker Database, 3rd Edition) is a comprehensive platform that integrates biomarker literature data, clinical data, and single-cell RNA sequencing (scRNA-seq) data to accelerate colorectal cancer research.

### What CBD3 Offers

- **Biomarker Database**: Curated colorectal cancer biomarkers mined from PubMed literature and manually validated by domain experts
- **Gene Expression Atlas**: Interactive UMAP-based single-cell gene expression visualization
- **Protein Interaction Networks**: PPI networks sourced from the STRING database, with expansion, module detection, proximity testing, enrichment analysis and reproducible exports
- **MAMOF Framework**: Multi-Ancestry Multi-Omics Framework for identifying universal and population-specific biomarkers
- **Advanced Search**: Multi-condition search across the biomarker database with save/load support

## Quick Start

1. **Browse Biomarkers**: Visit the <a href="/biomarkers">Biomarkers</a> page to explore curated biomarker records
2. **Search**: Use the homepage search bar or the <a href="/advanced">Advanced Search</a> page for complex queries
3. **Explore Expression**: Open the <a href="/umap">UMAP Explorer</a> to visualize scRNA-seq UMAP plots
4. **Analyze Networks**: Open <a href="/network">Network Analysis</a> to build, expand and statistically analyze PPI networks
5. **Learn the Framework**: Read about the <a href="/mamof">MAMOF Framework</a>
6. **Download**: Export data from the <a href="/download">Download</a> page

## Data Sources

CBD3 integrates data from the following authoritative sources:

- **PubMed**: Curated biomarker records from scientific literature
- **TCGA**: Clinical validation data (COAD and READ cohorts)
- **GEO**: Single-cell RNA sequencing datasets
- **STRING**: Protein-protein interaction networks
- **DrugBank**: Drug-target association data
- **Pathway Databases**: KEGG, Reactome, GO, and others

## Technology Stack

- **Frontend**: Vue 3, Vite, Element Plus, ECharts, Cytoscape.js
- **Backend**: Node.js, Express 5, MySQL2
- **Database**: MySQL (12+ tables, ~36.4M rows)
- **Build**: Vite, pnpm
- **Documentation**: VitePress

## Citation

If you use CBD3 in your research, please cite our work. See the [Cite & Support](/5_cite) page for details.

## For Developers

CBD3 is an open-source project released under the MIT license. See the [Developer Guide](/4_dev) for technical documentation.
