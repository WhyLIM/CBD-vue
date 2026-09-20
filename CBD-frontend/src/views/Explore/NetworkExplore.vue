<template>
  <div class="explore">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Network Exploration</h1>
            <p class="hero-subtitle">
              Visualize, expand and statistically analyze protein-protein interaction networks using STRING database
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="main-content">
      <div class="container">
        <!-- Main Layout Container -->
        <el-row :gutter="24" class="main-container">
          <!-- Left Sidebar - Control Panel -->
          <el-col :xs="24" :lg="7" class="control-aside">
            <div class="control-panel">
              <el-card class="control-card">
                <template #header>
                  <h3 class="panel-title">
                    <font-awesome-icon :icon="['fas', 'cogs']" />
                    Network Parameters
                  </h3>
                </template>

                <!-- Protein Input Methods -->
                <div class="input-section">
                  <el-tabs v-model="inputMethod" @tab-change="handleInputMethodChange">
                    <el-tab-pane label="Manual Input" name="manual">
                      <div class="form-group">
                        <label class="form-label">Protein Names</label>
                        <el-input v-model="proteinInput" type="textarea" :rows="6"
                          placeholder="Enter protein names (one per line)&#10;Example:&#10;TP53&#10;BRCA1&#10;EGFR"
                          class="protein-textarea" />
                        <div class="input-hint">
                          <font-awesome-icon :icon="['fas', 'info-circle']" />
                          Gene symbols or protein names are accepted.
                        </div>
                      </div>
                    </el-tab-pane>

                    <el-tab-pane label="From Database" name="database">
                      <div class="form-group">
                        <label class="form-label">Select Proteins from CBD</label>
                        <el-select v-model="selectedProteins" multiple filterable
                          placeholder="Search and select proteins" class="protein-select" :loading="loadingProteins">
                          <el-option v-for="protein in availableProteins" :key="protein.value" :label="protein.label"
                            :value="protein.value" />
                        </el-select>
                      </div>
                    </el-tab-pane>

                    <el-tab-pane label="File Upload" name="file">
                      <div class="form-group">
                        <label class="form-label">Upload Protein List</label>
                        <el-upload class="upload-demo" drag :auto-upload="false" :on-change="handleFileUpload"
                          accept=".txt,.csv" :limit="1">
                          <font-awesome-icon :icon="['fas', 'upload']" class="upload-icon" />
                          <div class="el-upload__text">
                            Drop file here or <em>click to upload</em>
                          </div>
                          <template #tip>
                            <div class="el-upload__tip">
                              txt/csv files with one protein per line
                            </div>
                          </template>
                        </el-upload>
                        <div class="input-hint" v-if="uploadedProteinCount > 0">
                          <font-awesome-icon :icon="['fas', 'check-circle']" />
                          {{ uploadedProteinCount }} proteins loaded from file.
                        </div>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                </div>

                <!-- Network Parameters -->
                <div class="parameters-section">
                  <el-row :gutter="16">
                    <el-col :span="24">
                      <div class="form-group">
                        <label class="form-label">
                          Species
                          <el-tooltip content="Over 12,000 STRING species. Proximity test & local expansion are human-only."
                            placement="top">
                            <font-awesome-icon :icon="['fas', 'question-circle']" class="help-icon" />
                          </el-tooltip>
                        </label>
                        <el-select-v2 v-model="networkParams.species" :options="speciesOptions" filterable
                          placeholder="Select species" class="param-select" :loading="loadingSpecies" />
                      </div>
                    </el-col>
                  </el-row>

                  <el-row :gutter="16">
                    <el-col :span="24">
                      <div class="form-group">
                        <label class="form-label">
                          Confidence Score
                          <el-tooltip content="Minimum interaction confidence score (0-1000)" placement="top">
                            <font-awesome-icon :icon="['fas', 'question-circle']" class="help-icon" />
                          </el-tooltip>
                        </label>
                        <el-slider v-model="networkParams.requiredScore" :min="0" :max="1000" :step="50" show-input
                          class="score-slider" />
                      </div>
                    </el-col>
                  </el-row>

                  <el-row :gutter="16">
                    <el-col :span="24">
                      <div class="form-group">
                        <label class="form-label">Network Type</label>
                        <el-radio-group v-model="networkParams.networkType" class="network-type-group">
                          <el-radio label="functional">Functional</el-radio>
                          <el-radio label="physical">Physical</el-radio>
                        </el-radio-group>
                      </div>
                    </el-col>
                  </el-row>

                  <el-row :gutter="16">
                    <el-col :span="24">
                      <div class="form-group">
                        <label class="form-label">
                          Edge Coloring
                          <el-tooltip content="Confidence: gradient by combined score. Evidence: color by dominant evidence channel."
                            placement="top">
                            <font-awesome-icon :icon="['fas', 'question-circle']" class="help-icon" />
                          </el-tooltip>
                        </label>
                        <el-select v-model="edgeColorMode" class="param-select">
                          <el-option label="Confidence (gradient)" value="confidence" />
                          <el-option label="Evidence (dominant channel)" value="evidence" />
                        </el-select>
                      </div>
                    </el-col>
                  </el-row>

                  <el-row>
                    <el-col :span="24">
                      <div class="form-group">
                        <el-checkbox v-model="networkParams.hideDisconnected">
                          Hide disconnected nodes
                        </el-checkbox>
                      </div>
                    </el-col>
                  </el-row>

                  <el-row :gutter="16">
                    <el-col :span="24">
                      <div class="form-group">
                        <label class="form-label">
                          Color Scheme
                          <el-tooltip content="Node & module colors, applied live. Custom lets you pick the node color and the full module palette; modules beyond the palette get auto-generated distinct colors."
                            placement="top">
                            <font-awesome-icon :icon="['fas', 'question-circle']" class="help-icon" />
                          </el-tooltip>
                        </label>
                        <el-select v-model="paletteKey" class="param-select">
                          <el-option v-for="(p, key) in PALETTES" :key="key" :label="p.label" :value="key" />
                          <el-option label="Custom" value="custom" />
                        </el-select>
                        <div v-if="paletteKey === 'custom'" class="custom-palette">
                          <div class="custom-palette-row">
                            <span class="custom-palette-label">Node</span>
                            <el-color-picker v-model="customPalette.node" size="small" />
                          </div>
                          <div class="custom-palette-row">
                            <span class="custom-palette-label">Modules</span>
                            <div class="module-pickers">
                              <el-color-picker v-for="(c, i) in customPalette.modules" :key="i"
                                v-model="customPalette.modules[i]" size="small" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                  <el-row :gutter="12">
                    <el-col :span="16">
                      <el-button type="primary" @click="generateNetwork" :loading="loading" class="generate-btn" block>
                        <font-awesome-icon :icon="['fas', 'play']" />&nbsp;Generate Network
                      </el-button>
                    </el-col>
                    <el-col :span="8">
                      <el-button @click="clearInput" class="clear-btn" block>
                        <font-awesome-icon :icon="['fas', 'trash']" />&nbsp;Clear
                      </el-button>
                    </el-col>
                  </el-row>
                </div>

                <!-- Network Expansion（建网后的扩展动作，生成网络后出现） -->
                <div v-if="networkGenerated" class="expansion-section">
                  <label class="form-label">
                    <font-awesome-icon :icon="['fas', 'project-diagram']" />
                    Network Expansion
                    <el-tooltip
                      content="Expand the current network with top-scoring STRING interaction partners of each protein. Human uses the local index (instant); other species query STRING."
                      placement="top">
                      <font-awesome-icon :icon="['fas', 'question-circle']" class="help-icon" />
                    </el-tooltip>
                  </label>
                  <el-slider v-model="expandPartners" :min="0" :max="20" :step="1" show-input class="score-slider" />
                  <el-button type="primary" plain :disabled="expandPartners === 0"
                    :loading="expanding" @click="applyExpansion" class="expand-btn" block>
                    Apply Expansion
                  </el-button>
                </div>

                <!-- Example Buttons -->
                <div class="example-section" v-if="!networkGenerated">
                  <label class="form-label">Try Examples:</label>
                  <div class="example-buttons">
                    <el-button v-for="example in examples" :key="example.key" size="small" @click="loadExample(example)"
                      class="example-btn">
                      {{ example.label }}
                    </el-button>
                  </div>
                </div>
              </el-card>

              <!-- Network Statistics -->
              <el-card v-if="networkStats" class="stats-card">
                <template #header>
                  <h3 class="panel-title">
                    <font-awesome-icon :icon="['fas', 'chart-bar']" />
                    Network Statistics
                  </h3>
                </template>
                <div class="stats-content">
                  <el-row :gutter="8" v-for="(value, key) in networkStats" :key="key" class="stat-row">
                    <el-col :span="14">
                      <span class="stat-label">{{ formatStatLabel(key) }}:</span>
                    </el-col>
                    <el-col :span="10">
                      <span class="stat-value">{{ formatStatValue(key, value) }}</span>
                    </el-col>
                  </el-row>
                </div>
              </el-card>
            </div>
          </el-col>

          <!-- Main Content Area -->
          <el-col :xs="24" :lg="17" class="main-area">
            <!-- Network Visualization -->
            <el-card class="network-card">
              <NetworkVisualization ref="vizRef" :network-data="networkData" :loading="loading"
                :topology-data="topologyData" :edge-color-mode="edgeColorMode" :metric-mode="metricMode || null"
                :palette="activePalette"
                :score-threshold="scoreThreshold / 1000" :hide-disconnected="networkParams.hideDisconnected"
                :module-assignments="moduleAssignments" :membership="compareMembership" @node-selected="handleNodeSelected"
                @edge-selected="handleEdgeSelected" @search-protein="handleSearchProtein" />
            </el-card>

            <!-- Help Section -->
            <div class="help-section">
              <el-card class="help-card">
                <template #header>
                  <h3 class="panel-title help-toggle" @click="helpExpanded = !helpExpanded">
                    <font-awesome-icon :icon="['fas', 'question-circle']" />
                    Parameter Interpretation
                    <font-awesome-icon :icon="['fas', helpExpanded ? 'chevron-up' : 'chevron-down']" class="help-chevron" />
                  </h3>
                </template>
                <div v-show="helpExpanded">
                  <el-collapse v-model="activeHelp">
                  <el-collapse-item title="Network Building" name="build">
                    <div class="help-content">
                      <ul>
                        <li><strong>Input:</strong> Type proteins one per line, pick them from the CBD database, or
                          upload a txt/csv list. Unmatched names are reported before the network is built.</li>
                        <li><strong>Species:</strong> All 12,000+ STRING species are supported for network building and
                          enrichment. Local-index features (instant expansion, proximity test) are human-only.</li>
                        <li><strong>Confidence Score:</strong> Minimum combined score (0-1000) for an interaction to be
                          included; 400 corresponds to medium confidence (STRING default).</li>
                        <li><strong>Network Type:</strong> Functional aggregates all evidence channels; Physical keeps
                          only direct physical binding.</li>
                      </ul>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="Network Expansion" name="expansion">
                    <div class="help-content">
                      <ul>
                        <li><strong>First-shell Partners:</strong> Adds the top-scoring STRING interaction partners of
                          each protein in the current network.</li>
                        <li><strong>Human:</strong> uses the bundled local STRING index (combined score >= 400) -
                          instant and available even when string-db.org is unreachable. Other species query STRING
                          live.</li>
                        <li>Expanding recomputes statistics and topology; module, proximity and path results are reset
                          because the network changed. Apply repeatedly to grow the network further.</li>
                      </ul>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="Visualization" name="viz">
                    <div class="help-content">
                      <ul>
                        <li><strong>Edge Coloring - Confidence:</strong> gray gradient from light (low) to dark (high)
                          combined score. <strong>Evidence:</strong> each edge is colored by its dominant evidence
                          channel (see the legend): neighbourhood, gene fusion, co-occurrence, co-expression,
                          experiments, databases or text-mining.</li>
                        <li><strong>Color Scheme:</strong> palette presets or a custom node/module palette. Your choice
                          is stored in this browser and applied live.</li>
                        <li><strong>Live edge filter</strong> hides edges below a confidence threshold without
                          refetching; <strong>Hide disconnected nodes</strong> removes proteins left without visible
                          edges.</li>
                        <li><strong>Shortest path finder</strong> highlights the route connecting two proteins of the
                          network.</li>
                        <li><strong>Layout button</strong> cycles through force-directed, circular, grid, hierarchical
                          and concentric arrangements.</li>
                      </ul>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="Topology &amp; Modules" name="topology">
                    <div class="help-content">
                      <ul>
                        <li><strong>Degree:</strong> number of connections of a protein within the network.</li>
                        <li><strong>Betweenness:</strong> how many shortest paths pass through the node - bridge/hub
                          proteins score high.</li>
                        <li><strong>Closeness:</strong> inverse average distance to all other nodes - how close the
                          protein sits to the rest of the network.</li>
                        <li><strong>Clustering coefficient:</strong> how interconnected a protein's neighbours are among
                          themselves (1 = complete neighbourhood).</li>
                        <li><strong>Modules:</strong> communities detected with the Louvain algorithm; nodes in the same
                          module are more interconnected with each other than with the rest. Density = fraction of
                          possible internal edges present (1.0 = fully connected).</li>
                        <li><strong>Color/Size nodes by</strong> maps any topology metric onto node size and color.</li>
                      </ul>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="Proximity Test" name="proximity">
                    <div class="help-content">
                      <ul>
                        <li>Tests whether your protein set is significantly more interconnected than expected by
                          chance, using the local human STRING network (combined score >= 400).</li>
                        <li><strong>Cohesion:</strong> internal edge count of your set vs. degree-matched random gene
                          sets. <strong>z &gt; 2 and p &lt; 0.05</strong> indicate a functionally cohesive (non-random)
                          set.</li>
                        <li><strong>Proximity:</strong> mean shortest distance within your set vs. random sets - lower
                          is closer.</li>
                        <li>Randomization: each permutation draws one gene of the same degree per seed (500 by
                          default); p-values are empirical with +1 correction.</li>
                      </ul>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="Enrichment &amp; Compare" name="enrichment">
                    <div class="help-content">
                      <ul>
                        <li><strong>Enrichment:</strong> over-represented GO / KEGG / pathway / disease terms computed
                          by STRING, grouped by category. <strong>Genes</strong> = how many of your input proteins belong
                          to the term; judge significance by the FDR-corrected value rather than the raw P-value.</li>
                        <li><strong>Module enrichment</strong> runs the same test for a single detected module.</li>
                        <li><strong>Compare:</strong> build the union network of two sets, color nodes by membership
                          (clay = A only, dusty blue = B only, mauve = shared) and report overlap with the Jaccard
                          index |A intersects B| / |A union B|.</li>
                      </ul>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="Network Statistics" name="stats">
                    <div class="help-content">
                      <ul>
                        <li><strong>Nodes / Edges:</strong> number of proteins and interactions in the displayed
                          network.</li>
                        <li><strong>Avg Degree:</strong> average number of interactions per protein.</li>
                        <li><strong>Clustering Coeff:</strong> average local clustering coefficient across nodes.</li>
                        <li><strong>Expected Edges / P-value:</strong> PPI enrichment test - whether the observed
                          interactions significantly exceed what is expected for random proteins of the same size and
                          degree.</li>
                      </ul>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="Downloads" name="downloads">
                    <div class="help-content">
                      <ul>
                        <li><strong>PNG / SVG:</strong> capture the styled network exactly as shown (colors, layout).</li>
                        <li><strong>GraphML:</strong> open the network in Cytoscape desktop, including topology
                          attributes.</li>
                        <li><strong>Download All:</strong> the displayed edges (with evidence channel scores),
                          enrichment table, module assignments, the GraphML file and a full JSON snapshot of every
                          analysis and parameter - a complete, reproducible record of the current state.</li>
                      </ul>
                    </div>
                  </el-collapse-item>
                </el-collapse>
                </div>
              </el-card>
            </div>

            <!-- Analysis Results -->
            <div v-if="networkGenerated" class="analysis-section">
              <el-card class="analysis-card">
                <template #header>
                  <h3 class="panel-title">
                    <font-awesome-icon :icon="['fas', 'microscope']" />
                    Network Analysis
                  </h3>
                </template>

                <el-tabs v-model="analysisActiveTab" type="card">

                  <!-- ============ Topology ============ -->
                  <el-tab-pane label="Topology" name="topology">
                    <div class="toolbar-row">
                      <div class="toolbar-item">
                        <label class="toolbar-label">Color/Size nodes by</label>
                        <el-select v-model="metricMode" class="compact-select" clearable placeholder="None (default)">
                          <el-option label="None (default)" value="" />
                          <el-option label="Degree" value="degree" />
                          <el-option label="Betweenness" value="betweenness" />
                          <el-option label="Closeness" value="closeness" />
                          <el-option label="Clustering coefficient" value="clustering" />
                        </el-select>
                      </div>
                      <div class="toolbar-item grow">
                        <label class="toolbar-label">
                          Live edge filter (≥ {{ scoreThreshold / 1000 }})
                        </label>
                        <el-slider v-model="scoreThreshold" :min="0" :max="1000" :step="50" class="filter-slider" />
                      </div>
                    </div>

                    <div class="toolbar-row">
                      <div class="toolbar-item grow">
                        <label class="toolbar-label">Shortest path finder</label>
                        <div class="path-controls">
                          <el-select v-model="pathFrom" filterable placeholder="From protein" class="path-select">
                            <el-option v-for="p in networkProteins" :key="p" :label="p" :value="p" />
                          </el-select>
                          <el-select v-model="pathTo" filterable placeholder="To protein" class="path-select">
                            <el-option v-for="p in networkProteins" :key="p" :label="p" :value="p" />
                          </el-select>
                          <el-button type="primary" plain :disabled="!pathFrom || !pathTo || pathFrom === pathTo"
                            @click="findPath">
                            Find path
                          </el-button>
                        </div>
                        <div v-if="pathResult" class="path-result">
                          <font-awesome-icon :icon="['fas', 'route']" />
                          {{ pathResult.genes.join(' → ') }} <span class="path-meta">({{ pathResult.distance }}
                          steps)</span>
                        </div>
                      </div>
                    </div>

                    <el-table :data="topologyData" class="topology-table" max-height="320">
                      <el-table-column prop="protein" label="Protein" min-width="120" />
                      <el-table-column prop="degree" label="Degree" min-width="90" align="center" sortable />
                      <el-table-column prop="betweenness" label="Betweenness" min-width="140" align="center" sortable />
                      <el-table-column prop="closeness" label="Closeness" min-width="120" align="center" sortable />
                      <el-table-column prop="clustering" label="Clustering" min-width="120" align="center" sortable />
                    </el-table>
                  </el-tab-pane>

                  <!-- ============ Enrichment ============ -->
                  <el-tab-pane label="Enrichment" name="enrichment">
                    <el-tabs v-model="enrichmentActiveTab" type="card" class="enrichment-tabs">
                      <el-tab-pane v-for="(items, cat) in groupedEnrichment" :key="cat" :label="cat" :name="cat">
                        <el-table :data="items" class="enrichment-table" max-height="320">
                          <el-table-column prop="term" label="Term" min-width="110">
                            <template #default="{ row }">
                              <span v-html="row.termHtml || row.term"></span>
                            </template>
                          </el-table-column>
                          <el-table-column prop="description" label="Description" min-width="200">
                            <template #default="{ row }">
                              <span class="term-desc" :title="row.description">{{ row.description }}</span>
                            </template>
                          </el-table-column>
                          <el-table-column prop="number_of_genes" label="Genes" width="90" align="center" sortable />
                          <el-table-column prop="pvalue" label="P-value" width="110" align="center" sortable>
                            <template #default="{ row }">
                              {{ parseFloat(row.pvalue || row.p_value || 0).toExponential(2) }}
                            </template>
                          </el-table-column>
                          <el-table-column prop="fdr" label="FDR" width="100" align="center" sortable>
                            <template #default="{ row }">
                              {{ parseFloat(row.fdr || 0).toExponential(2) }}
                            </template>
                          </el-table-column>
                        </el-table>
                      </el-tab-pane>
                    </el-tabs>
                  </el-tab-pane>

                  <!-- ============ Modules ============ -->
                  <el-tab-pane label="Modules" name="modules">
                    <div class="toolbar-row">
                      <el-button type="primary" plain :loading="detecting" @click="detectModulesAction">
                        <font-awesome-icon :icon="['fas', 'layer-group']" />&nbsp;Detect modules (Louvain)
                      </el-button>
                      <el-button v-if="moduleData" @click="clearModules">Clear modules</el-button>
                      <span v-if="moduleData" class="module-hint">
                        {{ modules.length }} modules · colored in network
                      </span>
                    </div>

                    <el-table v-if="moduleData" :data="modules" class="module-table" max-height="320">
                      <el-table-column label="Module" width="90">
                        <template #default="{ row }">
                          <span class="module-badge" :style="{ background: moduleColorOf(row.id) }">{{ row.id + 1
                          }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column prop="size" label="Genes" width="80" sortable />
                      <el-table-column prop="internalEdges" label="Internal edges" width="125" sortable />
                      <el-table-column prop="density" label="Density" width="95" sortable>
                        <template #default="{ row }">{{ row.density.toFixed(2) }}</template>
                      </el-table-column>
                      <el-table-column label="Genes" min-width="180">
                        <template #default="{ row }">
                          <span class="gene-preview">{{ row.genes.slice(0, 8).join(', ') }}{{ row.genes.length > 8 ?
                            ', …' : '' }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="Actions" width="230">
                        <template #default="{ row }">
                          <el-button size="small" @click="isolateModule(row.id)">Isolate</el-button>
                          <el-button size="small" type="primary" plain @click="enrichModule(row)">Enrichment</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <div v-else class="tab-empty">
                      Detect functional modules to color the network and run module-level enrichment.
                    </div>
                  </el-tab-pane>

                  <!-- ============ Proximity ============ -->
                  <el-tab-pane label="Proximity" name="proximity">
                    <div class="proximity-intro">
                      Tests whether the current protein set ({{ currentProteins.length }} genes) sits significantly
                      closer to itself in the human STRING network (combined score ≥ 400) than degree-matched random
                      gene sets.
                      <span v-if="networkParams.species !== '9606'" class="proximity-warning">
                        <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
                        Human only — switch species to Homo sapiens to enable.
                      </span>
                    </div>

                    <div class="toolbar-row">
                      <el-select v-model="proximityPermutations" class="compact-select" style="width: 160px">
                        <el-option label="200 permutations" :value="200" />
                        <el-option label="500 permutations" :value="500" />
                        <el-option label="1000 permutations" :value="1000" />
                      </el-select>
                      <el-button type="primary" :loading="proximityRunning"
                        :disabled="networkParams.species !== '9606' || currentProteins.length < 2"
                        @click="runProximity">
                        <font-awesome-icon :icon="['fas', 'ruler-combined']" />&nbsp;Run proximity test
                      </el-button>
                    </div>

                    <template v-if="proximityResult">
                      <el-row :gutter="16" class="proximity-stats">
                        <el-col :span="6">
                          <div class="stat-box">
                            <div class="stat-box-label">Internal edges</div>
                            <div class="stat-box-value">{{ proximityResult.cohesion.observed_edges }}</div>
                            <div class="stat-box-meta">random mean {{ proximityResult.cohesion.random_mean }} ±
                              {{ proximityResult.cohesion.random_sd }}</div>
                          </div>
                        </el-col>
                        <el-col :span="6">
                          <div class="stat-box">
                            <div class="stat-box-label">Cohesion z-score</div>
                            <div class="stat-box-value" :class="zClass(proximityResult.cohesion.z_score)">
                              {{ proximityResult.cohesion.z_score }}
                            </div>
                            <div class="stat-box-meta">p = {{ proximityResult.cohesion.p_value }}</div>
                          </div>
                        </el-col>
                        <el-col :span="6">
                          <div class="stat-box">
                            <div class="stat-box-label">Proximity (mean dist.)</div>
                            <div class="stat-box-value">{{ proximityResult.observed.toFixed(2) }}</div>
                            <div class="stat-box-meta">random mean {{ proximityResult.random_mean.toFixed(2) }}</div>
                          </div>
                        </el-col>
                        <el-col :span="6">
                          <div class="stat-box">
                            <div class="stat-box-label">Verdict</div>
                            <div class="stat-box-value verdict">
                              <el-tag :type="verdictOf(proximityResult).type" size="small">{{ verdictOf(proximityResult).label }}</el-tag>
                            </div>
                            <div class="stat-box-meta">{{ proximityResult.permutations }} permutations</div>
                          </div>
                        </el-col>
                      </el-row>

                      <div ref="proximityChartRef" class="proximity-chart"></div>
                      <div class="proximity-note">
                        Histogram: internal-edge counts of degree-matched random gene sets; marked line = observed
                        value. A right-shifted observed value (higher z, low p) indicates the protein set is
                        functionally cohesive.
                      </div>
                    </template>
                    <div v-else class="tab-empty">Run the test to evaluate network cohesion of your protein set.</div>
                  </el-tab-pane>

                  <!-- ============ Compare ============ -->
                  <el-tab-pane label="Compare" name="compare">
                    <div class="compare-grid">
                      <div class="form-group">
                        <label class="form-label">Set A <span class="compare-color-dot" :style="{ background: MEMBERSHIP_COLORS.A }"></span></label>
                        <el-input v-model="compareA" type="textarea" :rows="5"
                          placeholder="One protein per line" class="protein-textarea" />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Set B <span class="compare-color-dot" :style="{ background: MEMBERSHIP_COLORS.B }"></span></label>
                        <el-input v-model="compareB" type="textarea" :rows="5"
                          placeholder="One protein per line" class="protein-textarea" />
                      </div>
                    </div>

                    <div class="toolbar-row">
                      <el-button type="primary" :loading="compareRunning" @click="runCompare">
                        <font-awesome-icon :icon="['fas', 'code-compare']" />&nbsp;Compare sets
                      </el-button>
                      <el-button v-if="compareMembership" @click="exitCompare">Exit comparison</el-button>
                    </div>

                    <template v-if="compareStats">
                      <el-row :gutter="16" class="proximity-stats">
                        <el-col :span="6">
                          <div class="stat-box">
                            <div class="stat-box-label">Set A</div>
                            <div class="stat-box-value">{{ compareStats.a }}</div>
                          </div>
                        </el-col>
                        <el-col :span="6">
                          <div class="stat-box">
                            <div class="stat-box-label">Set B</div>
                            <div class="stat-box-value">{{ compareStats.b }}</div>
                          </div>
                        </el-col>
                        <el-col :span="6">
                          <div class="stat-box">
                            <div class="stat-box-label">Shared</div>
                            <div class="stat-box-value" :style="{ color: MEMBERSHIP_COLORS.both }">{{ compareStats.shared }}</div>
                          </div>
                        </el-col>
                        <el-col :span="6">
                          <div class="stat-box">
                            <div class="stat-box-label">Jaccard index</div>
                            <div class="stat-box-value">{{ compareStats.jaccard }}</div>
                          </div>
                        </el-col>
                      </el-row>
                      <div class="proximity-note">
                        The network now shows the union of both sets, colored by membership (clay = A only, dusty blue = B
                        only, mauve = shared). Topology/enrichment tabs still reflect the original network until you
                        exit comparison.
                      </div>
                    </template>
                  </el-tab-pane>
                </el-tabs>
              </el-card>

              <!-- Module enrichment dialog -->
              <el-dialog v-model="moduleEnrichmentVisible" :title="`Module ${activeModule?.id + 1} — Functional Enrichment`"
                width="70%">
                <div v-loading="moduleEnrichmentLoading" style="min-height: 200px">
                  <el-tabs v-if="moduleGroupedEnrichment && Object.keys(moduleGroupedEnrichment).length" type="card">
                    <el-tab-pane v-for="(items, cat) in moduleGroupedEnrichment" :key="cat" :label="cat" :name="cat">
                      <el-table :data="items" max-height="360">
                        <el-table-column prop="term" label="Term" min-width="110">
                          <template #default="{ row }">
                            <span v-html="row.termHtml || row.term"></span>
                          </template>
                        </el-table-column>
                        <el-table-column prop="description" label="Description" min-width="200">
                          <template #default="{ row }">
                            <span class="term-desc" :title="row.description">{{ row.description }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column prop="number_of_genes" label="Genes" width="90" align="center" sortable />
                        <el-table-column prop="pvalue" label="P-value" width="110" align="center" sortable>
                          <template #default="{ row }">
                            {{ parseFloat(row.pvalue || row.p_value || 0).toExponential(2) }}
                          </template>
                        </el-table-column>
                        <el-table-column prop="fdr" label="FDR" width="100" align="center" sortable>
                          <template #default="{ row }">
                            {{ parseFloat(row.fdr || 0).toExponential(2) }}
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-tab-pane>
                  </el-tabs>
                  <div v-else-if="!moduleEnrichmentLoading" class="tab-empty">No significant enrichment found for this
                    module.</div>
                </div>
              </el-dialog>
            </div>

            <!-- Download Section -->
            <div v-if="networkGenerated" class="download-section">
              <el-card class="download-card">
                <template #header>
                  <h3 class="panel-title">
                    <font-awesome-icon :icon="['fas', 'download']" />
                    Download Analysis Results
                  </h3>
                </template>
                <div class="download-content">
                  <el-row :gutter="16" align="middle">
                    <el-col :span="12">
                      <p>Download the exact state you see: network edges, enrichment results, module assignments,
                        a GraphML for Cytoscape desktop, and a full JSON snapshot of all analyses. PNG / SVG capture
                        the styled network above.</p>
                    </el-col>
                    <el-col :span="12">
                      <div class="download-buttons">
                        <el-button @click="vizRef?.exportPng()">PNG</el-button>
                        <el-button @click="vizRef?.exportSvg()">SVG</el-button>
                        <el-button @click="vizRef?.exportGraphml()">GraphML</el-button>
                        <el-button type="primary" @click="downloadResults" :loading="downloading" class="download-btn">
                          <font-awesome-icon :icon="['fas', 'file-archive']" />&nbsp;Download All
                        </el-button>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </el-card>
            </div>

          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import NetworkVisualization from '@/components/NetworkVisualization.vue'
import stringApi from '@/services/stringApi'
import { NetworkAnalyzer, EnrichmentProcessor } from '@/utils/networkAnalysis'
import { detectModules } from '@/utils/networkModules'
import { PALETTES, DEFAULT_PALETTE_KEY, CUSTOM_MODULE_SLOTS, resolvePalette, MEMBERSHIP_COLORS, moduleColorAt } from '@/utils/networkColors'
import api from '@/utils/api'

const router = useRouter()

// Reactive data
const loading = ref(false)
const downloading = ref(false)
const loadingProteins = ref(false)
const networkGenerated = ref(false)

const inputMethod = ref('manual')
const proteinInput = ref('')
const selectedProteins = ref([])
const availableProteins = ref([])
const uploadedProteinCount = ref(0)
const inputProteins = ref([])      // 本次分析的原始输入
const resolveReport = ref(null)    // ID 映射报告

const networkParams = ref({
  species: '9606',
  requiredScore: 400,
  networkType: 'functional',
  hideDisconnected: false
})

const networkData = ref([])
const networkStats = ref(null)
const topologyData = ref([])
const enrichmentData = ref([])
const enrichmentActiveTab = ref('')
const groupedEnrichment = computed(() => {
  const processor = new EnrichmentProcessor()
  const grouped = processor.groupByCategory(enrichmentData.value || [])
  const keys = Object.keys(grouped)
  if (!enrichmentActiveTab.value && keys.length) {
    enrichmentActiveTab.value = keys[0]
  }
  return grouped
})
const activeHelp = ref([])
// Parameter Interpretation 面板整体展开/折叠：网络生成成功后自动折叠，可点击标题再展开
const helpExpanded = ref(true)

// 生效的蛋白集（含扩展加入的伙伴），用于统计/邻近性/模块等下游分析
const currentProteins = ref([])

// 可视化控件
const vizRef = ref(null)
const edgeColorMode = ref('confidence')

// 配色方案（预设 / 自定义），持久化到 localStorage
const PALETTE_STORAGE_KEY = 'cbd:network-palette'
const paletteKey = ref(DEFAULT_PALETTE_KEY)
const customPalette = reactive({
  node: PALETTES.morandiLight.node,
  modules: [...PALETTES.morandiLight.modules]
})
const activePalette = computed(() => resolvePalette(paletteKey.value, customPalette))

const persistPalette = () => {
  try {
    localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify({
      key: paletteKey.value,
      custom: { node: customPalette.node, modules: [...customPalette.modules] }
    }))
  } catch { /* ignore */ }
}

const restorePalette = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(PALETTE_STORAGE_KEY) || 'null')
    if (!saved) return
    if (typeof saved.key === 'string' && (saved.key === 'custom' || PALETTES[saved.key])) {
      paletteKey.value = saved.key
    }
    if (saved.custom && typeof saved.custom.node === 'string' && /^#[0-9a-fA-F]{6}$/.test(saved.custom.node)) {
      customPalette.node = saved.custom.node
    }
    if (Array.isArray(saved.custom?.modules)) {
      const mods = saved.custom.modules.filter(c => /^#[0-9a-fA-F]{6}$/.test(c))
      if (mods.length > 0) {
        for (let i = 0; i < CUSTOM_MODULE_SLOTS; i++) {
          customPalette.modules[i] = mods[i % mods.length]
        }
      }
    }
  } catch { /* ignore */ }
}

watch([paletteKey, customPalette], persistPalette, { deep: true })
const metricMode = ref('')
const scoreThreshold = ref(0)
const expandPartners = ref(5)
const expanding = ref(false)

// 物种列表
const loadingSpecies = ref(false)
const speciesOptions = ref([])

// 分析标签页
const analysisActiveTab = ref('topology')

// 最短路径
const pathFrom = ref('')
const pathTo = ref('')
const pathResult = ref(null)

// 模块
const detecting = ref(false)
const moduleData = ref(null)
const moduleEnrichmentVisible = ref(false)
const moduleEnrichmentLoading = ref(false)
const activeModule = ref(null)
const moduleEnrichmentData = ref([])
const moduleGroupedEnrichment = computed(() => {
  if (!moduleEnrichmentData.value?.length) return {}
  const processor = new EnrichmentProcessor()
  return processor.groupByCategory(moduleEnrichmentData.value)
})
const moduleAssignments = computed(() => moduleData.value?.assignments || null)
const modules = computed(() => moduleData.value?.modules || [])

// 邻近性检验
const proximityPermutations = ref(500)
const proximityRunning = ref(false)
const proximityResult = ref(null)
const proximityChartRef = ref(null)
let proximityChart = null

// 集合对比
const compareA = ref('')
const compareB = ref('')
const compareRunning = ref(false)
const compareMembership = ref(null)
const compareStats = ref(null)
let originalNetworkData = null
let originalTopologyData = null

// 网络中的蛋白列表（供路径搜索）
const networkProteins = computed(() =>
  topologyData.value.map(t => t.protein)
)

// Example data
const examples = ref([
  { key: 'cancer', label: 'Cancer Biomarkers', proteins: ['TP53', 'BRCA1', 'EGFR', 'MYC', 'RB1'] },
  { key: 'apoptosis', label: 'Apoptosis Pathway', proteins: ['TP53', 'BCL2', 'BAX', 'CASP3', 'CASP9'] },
  { key: 'cell_cycle', label: 'Cell Cycle', proteins: ['CDK1', 'CDK2', 'CCNA2', 'CCNB1', 'RB1'] }
])

// Methods
const handleInputMethodChange = () => {
  clearInput()
}

const handleFileUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const proteins = String(e.target.result || '').split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
    // 写回共享输入，保证 file 模式与其他模式使用同一数据源
    proteinInput.value = proteins.join('\n')
    uploadedProteinCount.value = proteins.length
  }
  reader.readAsText(file.raw)
}

const loadExample = (example) => {
  proteinInput.value = example.proteins.join('\n')
  inputMethod.value = 'manual'
  uploadedProteinCount.value = 0
  ElMessage.success(`Loaded ${example.label} example`)
}

const clearInput = () => {
  proteinInput.value = ''
  selectedProteins.value = []
  uploadedProteinCount.value = 0
  networkData.value = []
  networkStats.value = null
  topologyData.value = []
  enrichmentData.value = []
  networkGenerated.value = false
  currentProteins.value = []
  inputProteins.value = []
  resolveReport.value = null
  moduleData.value = null
  proximityResult.value = null
  pathResult.value = null
  pathFrom.value = ''
  pathTo.value = ''
  compareMembership.value = null
  compareStats.value = null
  compareA.value = ''
  compareB.value = ''
  originalNetworkData = null
  originalTopologyData = null
  scoreThreshold.value = 0
  metricMode.value = ''
}

const getProteinList = () => {
  // file 模式上传后同样写入 proteinInput，与 manual 共用
  if (inputMethod.value === 'database') {
    return selectedProteins.value
  }
  return String(proteinInput.value || '').split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

const flattenStats = (statsData) => {
  if (!statsData || statsData.length === 0) return null
  const statsObj = {}
  statsData.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'term' && key !== 'category') {
        statsObj[key] = item[key]
      }
    })
  })
  return statsObj
}

const generateNetwork = async () => {
  const proteins = getProteinList()

  if (proteins.length === 0) {
    ElMessage.warning('Please enter at least one protein name')
    return
  }

  loading.value = true

  try {
    // 初始化 STRING API（失败自动降级，不阻塞）
    await stringApi.getStringVersion()

    inputProteins.value = proteins

    // ID 映射报告（失败不影响建网）
    try {
      const resolveResult = await stringApi.resolveNs(proteins, networkParams.value.species)
      resolveReport.value = resolveResult
      if (resolveResult?.unmatched?.length > 0) {
        const list = resolveResult.unmatched.slice(0, 10).join(', ')
        const more = resolveResult.unmatched.length > 10 ? ` (+${resolveResult.unmatched.length - 10} more)` : ''
        ElMessage.warning(`${resolveResult.unmatched.length} identifier(s) could not be mapped: ${list}${more}`)
      }
    } catch (err) {
      resolveReport.value = null
      console.warn('Resolve step skipped:', err?.message)
    }

    // Get network data from STRING API
    const rawNetworkData = await stringApi.getProteinNetwork(
      proteins,
      networkParams.value.species,
      networkParams.value.requiredScore,
      networkParams.value.networkType
    )

    if (!rawNetworkData || rawNetworkData.length === 0) {
      ElMessage.warning('No interactions found for the given proteins')
      loading.value = false
      return
    }

    networkData.value = rawNetworkData
    currentProteins.value = [...new Set(
      rawNetworkData.flatMap(r => [r.preferredName_A, r.preferredName_B])
    )]

    // Get network statistics
    networkStats.value = flattenStats(await stringApi.getNetworkStats(currentProteins.value, networkParams.value.species))

    // Calculate topology analysis
    topologyData.value = new NetworkAnalyzer(rawNetworkData).getTopologyAnalysis()

    // Get enrichment analysis（基于输入列表而非仅网络内蛋白）
    const enrichmentRawData = await stringApi.getEnrichmentAnalysis(proteins, networkParams.value.species)
    if (enrichmentRawData && enrichmentRawData.length > 0) {
      const processor = new EnrichmentProcessor()
      enrichmentData.value = processor.processEnrichmentData(enrichmentRawData, networkParams.value.species)
    }

    // 重置下游分析状态
    moduleData.value = null
    proximityResult.value = null
    pathResult.value = null
    pathFrom.value = ''
    pathTo.value = ''
    compareMembership.value = null
    compareStats.value = null
    originalNetworkData = null
    originalTopologyData = null

    networkGenerated.value = true
    // 网络生成后收起 Parameter Interpretation 面板，让位给可视化与结果区
    helpExpanded.value = false
    if (!enrichmentData.value?.length) {
      ElMessage.success('Network generated (no enrichment results returned)')
    } else {
      ElMessage.success('Network generated successfully')
    }

  } catch (error) {
    console.error('generateNetwork failed:', error)
    ElMessage.error('Failed to generate network. Please check your input and try again.')
  } finally {
    loading.value = false
  }
}

// ---- 网络扩展 ----
const applyExpansion = async () => {
  if (!currentProteins.value.length || expanding.value) return
  expanding.value = true
  try {
    const result = await stringApi.expandNetwork(currentProteins.value, {
      species: networkParams.value.species,
      addPartners: expandPartners.value,
      requiredScore: networkParams.value.requiredScore,
      networkType: networkParams.value.networkType
    })

    const pairKey = (r) => [r.preferredName_A, r.preferredName_B].sort().join('|')
    const existing = new Set(networkData.value.map(pairKey))
    const newRows = (result.rows || []).filter(r => !existing.has(pairKey(r)))
    networkData.value = [...networkData.value, ...newRows]
    currentProteins.value = [...new Set([...currentProteins.value, ...(result.added_partners || [])])]

    topologyData.value = new NetworkAnalyzer(networkData.value).getTopologyAnalysis()
    networkStats.value = flattenStats(await stringApi.getNetworkStats(currentProteins.value, networkParams.value.species))

    // 扩展后原模块/邻近性/路径/对比结果失效
    moduleData.value = null
    proximityResult.value = null
    pathResult.value = null

    const sourceLabel = result.source === 'local_index' ? 'local index' : 'STRING API'
    if (result.unresolved?.length) {
      ElMessage.warning(`Expanded with ${result.added_partners?.length || 0} partners from ${sourceLabel}. Unresolved: ${result.unresolved.join(', ')}`)
    } else {
      ElMessage.success(`Expanded with ${result.added_partners?.length || 0} first-shell partners (${sourceLabel})`)
    }
  } catch (error) {
    console.error('Expansion failed:', error)
    ElMessage.error('Failed to expand network')
  } finally {
    expanding.value = false
  }
}

// ---- 模块检测 ----
const detectModulesAction = async () => {
  if (!networkData.value?.length) return
  detecting.value = true
  try {
    await nextTick()
    moduleData.value = detectModules(networkData.value)
    if (modules.value.length === 0) {
      ElMessage.info('No modules with ≥2 genes were found')
    } else {
      ElMessage.success(`${modules.value.length} modules detected`)
    }
  } catch (error) {
    console.error('Module detection failed:', error)
    ElMessage.error('Module detection failed')
  } finally {
    detecting.value = false
  }
}

const clearModules = () => {
  moduleData.value = null
  vizRef.value?.clearIsolation()
}

const isolateModule = (moduleId) => {
  vizRef.value?.isolateModule(moduleId)
}

const enrichModule = async (moduleRow) => {
  activeModule.value = moduleRow
  moduleEnrichmentVisible.value = true
  moduleEnrichmentLoading.value = true
  moduleEnrichmentData.value = []
  try {
    const raw = await stringApi.getEnrichmentAnalysis(moduleRow.genes, networkParams.value.species)
    if (raw && raw.length > 0) {
      const processor = new EnrichmentProcessor()
      moduleEnrichmentData.value = processor.processEnrichmentData(raw, networkParams.value.species)
    }
  } catch (error) {
    console.error('Module enrichment failed:', error)
    ElMessage.error('Module enrichment failed')
  } finally {
    moduleEnrichmentLoading.value = false
  }
}

const moduleColorOf = (id) => moduleColorAt(activePalette.value, id)

// ---- 邻近性检验 ----
const runProximity = async () => {
  if (proximityRunning.value) return
  proximityRunning.value = true
  proximityResult.value = null
  try {
    proximityResult.value = await stringApi.getProximity(currentProteins.value, proximityPermutations.value)
    await nextTick()
    renderProximityChart()
  } catch (error) {
    console.error('Proximity test failed:', error)
    ElMessage.error(error?.message || 'Proximity test failed')
  } finally {
    proximityRunning.value = false
  }
}

const verdictOf = (r) => {
  const p = r.cohesion.p_value
  if (p < 0.01 || r.cohesion.z_score > 2.58) return { label: 'Cohesive', type: 'success' }
  if (p < 0.05 || r.cohesion.z_score > 1.96) return { label: 'Suggestive', type: 'warning' }
  return { label: 'Not clustered', type: 'info' }
}

const zClass = (z) => (z > 1.96 ? 'z-high' : '')

const renderProximityChart = () => {
  if (!proximityChartRef.value || !proximityResult.value) return
  if (!proximityChart) {
    proximityChart = echarts.init(proximityChartRef.value)
  }
  const dist = proximityResult.value.cohesion_distribution || []
  if (dist.length === 0) return

  // 直方图分箱
  const min = Math.min(...dist)
  const max = Math.max(...dist, proximityResult.value.cohesion.observed_edges)
  const bins = Math.min(25, Math.max(8, Math.round(Math.sqrt(dist.length))))
  const width = (max - min) / bins || 1
  const counts = new Array(bins).fill(0)
  const labels = []
  for (let i = 0; i < bins; i++) {
    labels.push((min + width * (i + 0.5)).toFixed(1))
  }
  dist.forEach(v => {
    const idx = Math.min(bins - 1, Math.floor((v - min) / width))
    counts[idx]++
  })

  const obs = proximityResult.value.cohesion.observed_edges

  proximityChart.setOption({
    grid: { left: 50, right: 20, top: 30, bottom: 40 },
    xAxis: { type: 'category', data: labels, name: 'internal edges' },
    yAxis: { type: 'value', name: 'frequency' },
    series: [{
      type: 'bar',
      data: counts,
      itemStyle: { color: '#9aa8d4' },
      markLine: {
        symbol: 'none',
        data: [{ xAxis: Math.min(bins - 1, Math.max(0, Math.floor((obs - min) / width))) }],
        lineStyle: { color: '#B98B8B', width: 2 },
        label: { formatter: `observed = ${obs}`, color: '#9E7B7B' }
      }
    }],
    tooltip: { trigger: 'axis' }
  })
}

// ---- 集合对比 ----
const parseProteinSet = (text) => [...new Set(
  String(text || '').split(/[\n,;]/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
)]

const runCompare = async () => {
  const setA = parseProteinSet(compareA.value)
  const setB = parseProteinSet(compareB.value)
  if (setA.length === 0 || setB.length === 0) {
    ElMessage.warning('Both sets need at least one protein')
    return
  }
  compareRunning.value = true
  try {
    const upperA = new Set(setA.map(s => s.toUpperCase()))
    const upperB = new Set(setB.map(s => s.toUpperCase()))
    const shared = [...upperA].filter(g => upperB.has(g))
    const union = [...new Set([...upperA, ...upperB])]

    const rows = await stringApi.getProteinNetwork(
      union,
      networkParams.value.species,
      networkParams.value.requiredScore,
      networkParams.value.networkType
    )

    const membership = {}
    union.forEach(g => {
      const inA = upperA.has(g)
      const inB = upperB.has(g)
      membership[g] = inA && inB ? 'both' : inA ? 'A' : inB ? 'B' : null
    })
    // 网络中实际出现的蛋白（preferredName 可能与输入大小写不同）
    ;(rows || []).forEach(r => {
      for (const name of [r.preferredName_A, r.preferredName_B]) {
        const key = String(name).toUpperCase()
        if (!membership[key]) {
          const inA = upperA.has(key)
          const inB = upperB.has(key)
          membership[key] = inA && inB ? 'both' : inA ? 'A' : inB ? 'B' : null
        }
      }
    })

    if (!compareMembership.value) {
      originalNetworkData = networkData.value
      originalTopologyData = topologyData.value
    }
    // 对比切换的是展示网络，原网络上的模块/邻近性/路径结果一并失效
    moduleData.value = null
    proximityResult.value = null
    pathResult.value = null
    compareMembership.value = membership
    compareStats.value = {
      a: upperA.size,
      b: upperB.size,
      shared: shared.length,
      jaccard: (union.length ? shared.length / union.length : 0).toFixed(3)
    }
    // 展示并集网络（拓扑表同步更新；对比结束后恢复）
    networkData.value = rows || []
    topologyData.value = new NetworkAnalyzer(networkData.value).getTopologyAnalysis()
    ElMessage.success('Comparison network generated')
  } catch (error) {
    console.error('Compare failed:', error)
    ElMessage.error('Failed to build comparison network')
  } finally {
    compareRunning.value = false
  }
}

const exitCompare = () => {
  compareMembership.value = null
  compareStats.value = null
  if (originalNetworkData) networkData.value = originalNetworkData
  if (originalTopologyData) topologyData.value = originalTopologyData
  originalNetworkData = null
  originalTopologyData = null
}

// ---- 最短路径 ----
const findPath = () => {
  const result = vizRef.value?.highlightPath(pathFrom.value, pathTo.value)
  pathResult.value = result
}

// ---- 节点/边事件 ----
const handleNodeSelected = () => {
  // 详情对话框在 NetworkVisualization 内部处理
}

const handleEdgeSelected = () => {
  // 详情对话框在 NetworkVisualization 内部处理
}

const handleSearchProtein = async (proteinName) => {
  // 查询 CBD 数据库并跳转到对应 biomarker 详情页
  try {
    const response = await api.get('/biomarkers', {
      params: { search: proteinName, category: 'Protein', limit: 5 }
    })
    const items = Array.isArray(response.data) ? response.data : (response.data?.data || [])
    const exact = items.find(it => String(it.biomarker || it.string_name || '').toUpperCase() === String(proteinName).toUpperCase())
    const hit = exact || items[0]
    if (hit?.id) {
      // 新标签页打开详情页，避免离开当前网络分析状态
      const route = router.resolve(`/biomarkers/${hit.id}`)
      window.open(route.href, '_blank', 'noopener')
    } else {
      ElMessage.info(`No CBD entry found for ${proteinName}`)
    }
  } catch (error) {
    console.warn('CBD lookup failed:', error)
    ElMessage.info(`No CBD entry found for ${proteinName}`)
  }
}

// 从当前内存状态导出分析快照（不做任何外部请求，保证与屏幕内容一致）
const downloadText = (content, filename, mime = 'text/plain') => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const downloadResults = () => {
  if (!networkGenerated.value || downloading.value) return
  downloading.value = true

  try {
    const stamp = new Date().toISOString().slice(0, 10)

    // 1) 网络边（与图上完全一致，含扩展与证据通道分数）
    const channels = ['nscore', 'fscore', 'pscore', 'ascore', 'escore', 'dscore', 'tscore']
    const edgeLines = [['preferredName_A', 'preferredName_B', 'score', ...channels].join('\t')]
    networkData.value.forEach(r => {
      edgeLines.push([r.preferredName_A, r.preferredName_B, r.score, ...channels.map(c => r[c] ?? '')].join('\t'))
    })
    downloadText(edgeLines.join('\n'), `network_edges_${stamp}.tsv`, 'text/tab-separated-values')

    // 2) 富集（与 Enrichment 标签页同源同内容）
    const eLines = [['category', 'term', 'description', 'genes', 'p_value', 'fdr'].join('\t')]
    enrichmentData.value.forEach(r => {
      const desc = String(r.description || '').replace(/"/g, '""')
      eLines.push([r.category, r.term, `"${desc}"`, r.number_of_genes ?? '', r.p_value ?? r.pvalue ?? '', r.fdr ?? ''].join('\t'))
    })
    downloadText(eLines.join('\n'), `enrichment_${stamp}.tsv`, 'text/tab-separated-values')

    // 3) 模块归属（若已检测）
    if (moduleData.value) {
      const mLines = [['module_id', 'gene'].join('\t')]
      Object.entries(moduleData.value.assignments).forEach(([gene, mid]) => mLines.push([mid + 1, gene].join('\t')))
      downloadText(mLines.join('\n'), `modules_${stamp}.tsv`, 'text/tab-separated-values')
    }

    // 4) GraphML（当前图结构，含拓扑属性）
    const gml = vizRef.value?.buildGraphml()
    if (gml) downloadText(gml, `network_${stamp}.graphml`, 'application/xml')

    // 5) 完整分析快照
    const snapshot = {
      generatedAt: new Date().toISOString(),
      tool: 'CBD3 Network Analysis',
      stringVersion: stringApi.stableAddress || null,
      params: {
        species: networkParams.value.species,
        requiredScore: networkParams.value.requiredScore,
        networkType: networkParams.value.networkType,
        edgeColorMode: edgeColorMode.value,
        metricMode: metricMode.value || null,
        edgeFilter: scoreThreshold.value / 1000,
        inputProteins: inputProteins.value,
        analyzedProteins: currentProteins.value,
        unresolved: resolveReport.value?.unmatched || []
      },
      network: {
        nodeCount: networkProteins.value.length,
        edgeCount: networkData.value.length,
        stats: networkStats.value
      },
      topology: topologyData.value,
      enrichment: enrichmentData.value.map(({ termHtml, url, color, ...rest }) => rest),
      modules: moduleData.value ? { list: modules.value, assignments: moduleData.value.assignments } : null,
      proximity: proximityResult.value,
      path: pathResult.value,
      compare: compareStats.value ? { stats: compareStats.value, membership: compareMembership.value } : null
    }
    downloadText(JSON.stringify(snapshot, null, 2), `analysis_results_${stamp}.json`, 'application/json')

    ElMessage.success('Analysis bundle downloaded (edges / enrichment / modules / GraphML / JSON)')
  } catch (error) {
    console.error('Download failed:', error)
    ElMessage.error('Download failed')
  } finally {
    downloading.value = false
  }
}

const formatStatLabel = (key) => {
  const labels = {
    number_of_nodes: 'Nodes',
    number_of_edges: 'Edges',
    average_node_degree: 'Avg Degree',
    local_clustering_coefficient: 'Clustering Coeff',
    expected_number_of_edges: 'Expected Edges',
    p_value: 'P-value',
    ppi_enrichment_p_value: 'P-value'
  }
  return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatStatValue = (key, value) => {
  if (key.includes('p_value') || key.includes('pvalue')) {
    return parseFloat(value).toExponential(2)
  }
  return typeof value === 'number' ? value.toString() : value
}

// ---- 物种列表 ----
const PINNED_SPECIES = [
  { id: 9606, name: 'Human (Homo sapiens)' },
  { id: 10090, name: 'Mouse (Mus musculus)' },
  { id: 10116, name: 'Rat (Rattus norvegicus)' }
]

const fetchSpecies = async () => {
  loadingSpecies.value = true
  try {
    const data = await stringApi.getSpecies()
    const pinnedIds = new Set(PINNED_SPECIES.map(s => s.id))
    const rest = (data?.species || [])
      .filter(s => !pinnedIds.has(s.id))
      .map(s => ({ value: String(s.id), label: `${s.name} (${s.id})` }))
    speciesOptions.value = [
      ...PINNED_SPECIES.map(s => ({ value: String(s.id), label: s.name })),
      ...rest
    ]
  } catch (error) {
    console.warn('Species list unavailable, using defaults:', error)
    speciesOptions.value = PINNED_SPECIES.map(s => ({ value: String(s.id), label: s.name }))
  } finally {
    loadingSpecies.value = false
  }
}

const fetchAvailableProteins = async () => {
  loadingProteins.value = true
  try {
    // Helper function to extract data from different response structures
    const extractData = (response) => {
      const dataPaths = ['data', 'results', 'biomarkers']
      for (const path of dataPaths) {
        if (response.data?.[path] && Array.isArray(response.data[path])) {
          return response.data[path]
        }
      }
      return Array.isArray(response.data) ? response.data : null
    }

    // Helper function to get protein name from item
    const getProteinName = (item) =>
      item.biomarker || item.Biomarker || item.name || item.Name ||
      item.gene_symbol || item.protein_name || ''

    // Helper function to get protein description
    const getProteinDescription = (item, fallbackName) => {
      const desc = item.description || item.Description ||
                   item.Function || item.function || item.annotation || fallbackName
      return desc && desc.length > 50 ? desc.substring(0, 50) + '...' : desc || fallbackName
    }

    // Try API calls with fallback
    let response
    try {
      response = await api.get('/biomarkers', { params: { category: 'Protein', limit: 100 } })
    } catch {
      response = await api.get('/biomarkers', { params: { limit: 100 } })
    }

    const biomarkerData = extractData(response)
    if (!biomarkerData?.length) {
      throw new Error('No biomarker data returned from API')
    }

    // Filter and process protein data
    const proteinData = biomarkerData.filter(item => {
      const biomarker = getProteinName(item)
      if (!biomarker || typeof biomarker !== 'string') return false

      return biomarker.match(/^[A-Z][A-Z0-9]*[0-9]*$/) ||
             biomarker.toLowerCase().includes('protein') ||
             biomarker.toLowerCase().includes('gene') ||
             (biomarker.length <= 15 && biomarker.match(/^[A-Z]/))
    })

    if (proteinData.length === 0) {
      throw new Error('No protein data found after filtering')
    }

    availableProteins.value = proteinData.slice(0, 50).map(protein => {
      const name = getProteinName(protein)
      return {
        label: `${name}: ${getProteinDescription(protein, name)}`,
        value: name
      }
    })

  } catch (error) {
    // Fallback to default protein list
    availableProteins.value = [
      { label: 'TP53: Tumor protein p53', value: 'TP53' },
      { label: 'BRCA1: Breast cancer 1, early onset', value: 'BRCA1' },
      { label: 'BRCA2: Breast cancer 2, early onset', value: 'BRCA2' },
      { label: 'EGFR: Epidermal growth factor receptor', value: 'EGFR' },
      { label: 'MYC: MYC proto-oncogene', value: 'MYC' },
      { label: 'RB1: Retinoblastoma 1', value: 'RB1' },
      { label: 'APC: Adenomatous polyposis coli', value: 'APC' },
      { label: 'PTEN: Phosphatase and tensin homolog', value: 'PTEN' },
      { label: 'ATM: ATM serine/threonine kinase', value: 'ATM' },
      { label: 'CHEK2: Checkpoint kinase 2', value: 'CHEK2' }
    ]
    ElMessage.info('Using default protein list (database connection issue)')
  } finally {
    loadingProteins.value = false
  }
}

onMounted(() => {
  restorePalette()
  fetchAvailableProteins()
  fetchSpecies()
})

onUnmounted(() => {
  if (proximityChart) {
    proximityChart.dispose()
    proximityChart = null
  }
})
</script>

<style scoped>
.explore {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-content {
  padding: 40px 0;
}

.main-container {
  min-height: 600px;
  background: transparent;
}

.control-aside {
  background: transparent;
  padding-right: 20px;
  overflow: visible;
}

.main-area {
  padding: 0;
  background: transparent;
  overflow: visible;
}

/* Control Panel Styles */
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.control-card,
.stats-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 10px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.help-icon {
  color: #999;
  cursor: help;
  font-size: 0.8rem;
}

.protein-textarea {
  font-family: 'Consolas', 'Monaco', monospace;
}

.protein-select {
  width: 100%;
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
}

.upload-demo {
  width: 100%;
}

.upload-icon {
  font-size: 2rem;
  color: #8CA2B4;
  margin-bottom: 10px;
}

.parameters-section {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.expansion-section {
  border-top: 1px solid #eee;
  padding-top: 20px;
  margin-top: 20px;
}

.expand-btn {
  margin-top: 5px;
}

.param-select {
  width: 100%;
}

.score-slider {
  margin: 10px 0;
}

.network-type-group {
  display: flex;
  gap: 8px;
}

.custom-palette {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-palette-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-palette-label {
  font-size: 0.8rem;
  color: #556;
  font-weight: 600;
  width: 56px;
  flex-shrink: 0;
}

.module-pickers {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.action-buttons {
  display: flex;
  margin-top: 10px;
}

.generate-btn {
  flex: 1;
  background: var(--accent-gradient);
  border: none;
  color: white;
}

.clear-btn {
  background: #f5f5f5;
  border: 1px solid #ddd;
}

.example-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.example-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.example-btn {
  width: 100%;
  text-align: left;
  background: #f8fbff;
  border: 1px solid #e3f2fd;
  color: #1e3c72;
  margin-left: 0;
}

.example-btn:hover {
  background: #e3f2fd;
}

/* Statistics Card */
.stats-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
  color: #64748B;
  font-size: 0.9rem;
}

/* Visualization Panel */
.network-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

/* Analysis Section */
.analysis-section {
  margin-top: 40px;
}

.analysis-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.topology-table,
.enrichment-table,
.module-table {
  border-radius: 8px;
}

.term-desc {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
  color: #6b7280;
  font-size: 0.85rem;
}

.toolbar-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.toolbar-item {
  min-width: 160px;
}

.toolbar-item.grow {
  flex: 1;
  min-width: 220px;
}

.toolbar-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #556;
  margin-bottom: 4px;
}

.compact-select {
  width: 200px;
}

.filter-slider {
  padding-right: 12px;
}

.path-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.path-select {
  width: 180px;
}

.path-result {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #8F7440;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.path-meta {
  color: #999;
}

.module-badge {
  display: inline-block;
  min-width: 30px;
  text-align: center;
  color: #fff;
  font-weight: 600;
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 10px;
}

.gene-preview {
  font-size: 0.8rem;
  color: #555;
  font-family: 'Consolas', 'Monaco', monospace;
}

.module-hint {
  color: #888;
  font-size: 0.85rem;
}

.tab-empty {
  color: #999;
  font-size: 0.88rem;
  padding: 24px 0;
  text-align: center;
}

/* Proximity */
.proximity-intro {
  font-size: 0.88rem;
  color: #555;
  line-height: 1.55;
  margin-bottom: 14px;
}

.proximity-warning {
  display: block;
  margin-top: 6px;
  color: #c05621;
  font-weight: 600;
}

.proximity-stats {
  margin: 10px 0 6px;
}

.stat-box {
  background: #f8fafc;
  border: 1px solid #eef1f6;
  border-radius: 10px;
  padding: 10px 12px;
  text-align: center;
}

.stat-box-label {
  font-size: 0.75rem;
  color: #889;
  font-weight: 600;
}

.stat-box-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #4758a2;
  margin: 4px 0;
}

.stat-box-value.z-high {
  color: #0d8b43;
}

.stat-box-meta {
  font-size: 0.72rem;
  color: #99a;
}

.proximity-chart {
  width: 100%;
  height: 240px;
  margin-top: 8px;
}

.proximity-note {
  font-size: 0.78rem;
  color: #99a;
  line-height: 1.5;
  margin-top: 6px;
}

/* Compare */
.compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.compare-color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-left: 6px;
  vertical-align: middle;
}

/* Download Section */
.download-section {
  margin-top: 30px;
}

.download-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.download-content {
  padding: 10px 0;
}

.download-content p {
  margin-bottom: 10px;
  color: #666;
  font-size: 0.9rem;
}

.download-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.download-btn {
  background: var(--accent-gradient);
  border: none;
}

.enrichment-tabs :deep(.el-tabs__nav-wrap) {
  overflow: hidden;
}

/* Help Section */
.help-section {
  margin-top: 30px;
}

.help-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.help-toggle {
  cursor: pointer;
  user-select: none;
}

.help-chevron {
  margin-left: auto;
  font-size: 0.85em;
  color: #909399;
}

.help-content ul {
  margin: 0;
  padding-left: 20px;
}

.help-content li {
  margin-bottom: 8px;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .control-aside {
    width: 320px !important;
    padding-right: 15px;
  }
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .control-aside {
    width: 100% !important;
    padding-right: 0;
    padding-bottom: 20px;
    order: 2;
  }

  .main-area {
    order: 1;
    padding: 0;
  }

  .network-card {
    margin-bottom: 20px;
  }

  .compare-grid {
    grid-template-columns: 1fr;
  }

  .download-buttons {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }

  .main-content {
    padding: 20px 0;
  }

  .action-buttons .el-row {
    flex-direction: column;
  }

  .action-buttons .el-col {
    width: 100% !important;
    margin-bottom: 10px;
  }
}
</style>
