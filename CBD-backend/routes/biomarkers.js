const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get biomarker list
router.get('/', async (req, res) => {
  try {
    console.log('Received biomarker list request:', req.query);

    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      source = '',
      region = '',
      stage = '',
      sortBy = 'id',
      sortOrder = 'desc'
    } = req.query;

    // Parameter validation
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build query conditions
    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push(`(
        Biomarker LIKE ? OR 
        Discription LIKE ? OR 
        Application LIKE ? OR 
        Reference_first_author LIKE ? OR 
        Reference_journal LIKE ?
      )`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      whereConditions.push('Category = ?');
      queryParams.push(category);
    }

    if (source) {
      whereConditions.push('Source = ?');
      queryParams.push(source);
    }

    if (region) {
      whereConditions.push('Region = ?');
      queryParams.push(region);
    }

    if (stage) {
      whereConditions.push('Stage = ?');
      queryParams.push(stage);
    }

    const whereClause = whereConditions.length > 0 ?
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // Handle sorting parameters
    let actualSortBy = 'ID';
    let actualSortOrder = 'DESC';

    if (req.query.sort) {
      const [sortField, sortDirection] = req.query.sort.split('_');

      const validSortFields = ['id', 'name', 'year'];
      const validSortOrders = ['asc', 'desc'];

      // Field mapping table (avoid direct SQL concatenation)
      const fieldMap = {
        id: 'ID',
        name: 'Biomarker',
        year: 'Reference_year'
      };

      // Validate and get safe values
      actualSortBy = fieldMap[validSortFields.includes(sortField) ? sortField : 'id'];
      actualSortOrder = validSortOrders.includes(sortDirection) ? sortDirection.toUpperCase() : 'DESC';
    } else {
      // Use traditional sortBy and sortOrder parameters
      const fieldMap = {
        id: 'ID',
        biomarker: 'Biomarker',
        name: 'Biomarker',
        year: 'Reference_year',
        reference_year: 'Reference_year'
      };

      actualSortBy = fieldMap[sortBy] || 'ID';
      actualSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    }

    // Safe SQL concatenation
    const orderClause = `ORDER BY ${actualSortBy} ${actualSortOrder}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM biomarker ${whereClause}`;
    console.log('Executing count query:', countQuery, 'Parameters:', queryParams);
    const countResult = await db.query(countQuery, queryParams);
    console.log('Count query result:', countResult);
    const total = countResult[0]?.total || 0;
    console.log('Total records:', total);

    // Get data list
    const dataQuery = `
      SELECT 
        ID as id,
        Biomarker as biomarker,
        Category as category,
        String_Name as string_name,
        STRING_ID as string_id,
        Discription as description,
        Region as region,
        Race as race,
        Number as number,
        Male as male,
        Female as female,
        Age_Mean as age_mean,
        Age as age,
        Location as location,
        Stage as stage,
        Source as source,
        Experiment as experiment,
        Statictics as statistics,
        Application as application,
        Clinical_Use as clinical_use,
        Conclusion as conclusion,
        Reference_first_author as reference_first_author,
        Reference_journal as reference_journal,
        Reference_year as reference_year,
        PMID as pmid,
        Addition as addition,
        Target as target,
        Drugs as drugs
      FROM biomarker 
      ${whereClause} 
      ${orderClause} 
      LIMIT ? OFFSET ?
    `;
    console.log('Executing data query:', dataQuery, 'Parameters:', [...queryParams, limitNum, offset]);
    const rows = await db.query(dataQuery, [...queryParams, limitNum, offset]);
    console.log('Queried records count:', rows.length);

    // Format data - convert data to frontend expected format
    const formattedData = rows.map(row => ({
      id: row.id,
      biomarker: row.biomarker,
      category: row.category,
      string_name: row.string_name,
      string_id: row.string_id,
      description: row.description,
      region: row.region,
      race: row.race,
      number: row.number,
      male: row.male,
      female: row.female,
      age_mean: row.age_mean,
      age: row.age,
      location: row.location,
      stage: row.stage,
      source: row.source,
      experiment: row.experiment,
      statistics: row.statistics,
      application: row.application,
      clinical_use: row.clinical_use,
      conclusion: row.conclusion,
      target: row.target,
      drugs: row.drugs,
      pmid: row.pmid,
      addition: row.addition,
      // Format reference information
      reference: {
        author: row.reference_first_author,
        journal: row.reference_journal,
        year: row.reference_year
      }
    }));

    console.log('Formatted data example:', formattedData[0]);

    // Calculate pagination information
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    const response = {
      success: true,
      data: formattedData,
      pagination: {
        current: pageNum,
        total: totalPages,
        limit: limitNum,
        count: total,
        hasNext: hasNextPage,
        hasPrev: hasPrevPage
      },
      filters: {
        search,
        category,
        source,
        region,
        stage
      },
      sort: {
        by: sortBy,
        order: sortOrder
      }
    };

    console.log('Returning response:', {
      ...response,
      data: `${response.data.length} items`
    });

    res.json(response);

  } catch (error) {
    console.error('Failed to get biomarker list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get biomarker list',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Export data endpoint - must be placed before /:id route
router.get('/export', async (req, res) => {
  try {
    console.log('Received export request:', req.query);

    const {
      format = 'csv',
      fields = 'name,category,application,location,source,first_author,journal,publication_year,region,stage',
      reference_year_from,
      reference_year_to,
      category,
      application,
      location,
      source,
      region,
      stage,
      name
    } = req.query;

    // Build query conditions
    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (reference_year_from) {
      whereClause += ' AND Reference_year >= ?';
      queryParams.push(parseInt(reference_year_from));
    }

    if (reference_year_to) {
      whereClause += ' AND Reference_year <= ?';
      queryParams.push(parseInt(reference_year_to));
    }

    if (name) {
      whereClause += ' AND Biomarker LIKE ?';
      queryParams.push(`%${name}%`);
    }

    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      whereClause += ` AND Category IN (${categories.map(() => '?').join(',')})`;
      queryParams.push(...categories);
    }

    if (application) {
      const applications = Array.isArray(application) ? application : [application];
      whereClause += ` AND Application IN (${applications.map(() => '?').join(',')})`;
      queryParams.push(...applications);
    }

    if (location) {
      const locations = Array.isArray(location) ? location : [location];
      whereClause += ` AND Location IN (${locations.map(() => '?').join(',')})`;
      queryParams.push(...locations);
    }

    if (source) {
      const sources = Array.isArray(source) ? source : [source];
      whereClause += ` AND Source IN (${sources.map(() => '?').join(',')})`;
      queryParams.push(...sources);
    }

    if (region) {
      const regions = Array.isArray(region) ? region : [region];
      whereClause += ` AND Region IN (${regions.map(() => '?').join(',')})`;
      queryParams.push(...regions);
    }

    if (stage) {
      const stages = Array.isArray(stage) ? stage : [stage];
      whereClause += ` AND Stage IN (${stages.map(() => '?').join(',')})`;
      queryParams.push(...stages);
    }

    // Build field selection - use correct database field names
    const fieldMapping = {
      name: 'Biomarker',
      category: 'Category',
      application: 'Application',
      location: 'Location',
      source: 'Source',
      first_author: 'Reference_first_author',
      journal: 'Reference_journal',
      publication_year: 'Reference_year',
      region: 'Region',
      stage: 'Stage',
      description: 'Discription',
      pmid: 'PMID'
    };

    const selectedFields = fields.split(',').map(field => fieldMapping[field.trim()] || field.trim());
    const selectClause = selectedFields.join(', ');

    // Execute query
    const query = `SELECT ${selectClause} FROM biomarker ${whereClause} ORDER BY ID ASC`;
    console.log('Executing export query:', query);
    console.log('Query parameters:', queryParams);

    const results = await db.query(query, queryParams);
    console.log(`Export query result rows: ${results.length}`);

    // English headers mapping
    const headerMapping = {
      name: 'Biomarker Name',
      category: 'Category',
      application: 'Application',
      location: 'Location',
      source: 'Sample Source',
      first_author: 'First Author',
      journal: 'Journal',
      publication_year: 'Publication Year',
      region: 'Research Region',
      stage: 'Disease Stage',
      description: 'Description',
      pmid: 'PubMed ID'
    };

    if (format === 'csv') {
      const csvHeaders = fields.split(',').map(field => headerMapping[field.trim()] || field.trim());
      const csvRows = [csvHeaders.join(',')];

      results.forEach(row => {
        const values = selectedFields.map(field => {
          const value = row[field];
          // Handle values containing commas or quotes
          if (value && (value.toString().includes(',') || value.toString().includes('"'))) {
            return `"${value.toString().replace(/"/g, '""')}"`;
          }
          return value || '';
        });
        csvRows.push(values.join(','));
      });

      const csvContent = csvRows.join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="cbd_biomarkers_${new Date().toISOString().split('T')[0]}.csv"`);

      // Add BOM for proper Excel display
      res.write('\uFEFF');
      res.end(csvContent);
    } else if (format === 'excel') {
      const XLSX = require('xlsx');

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();

      // Prepare data with English headers
      const excelHeaders = fields.split(',').map(field => headerMapping[field.trim()] || field.trim());
      const excelData = [excelHeaders];

      results.forEach(row => {
        const rowData = selectedFields.map(field => row[field] || '');
        excelData.push(rowData);
      });

      // Create worksheet from data
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Biomarkers');

      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="cbd_biomarkers_${new Date().toISOString().split('T')[0]}.xlsx"`);
      res.send(excelBuffer);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="cbd_biomarkers_${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        success: true,
        data: results,
        total: results.length
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported format. Use csv, excel, or json.'
      });
    }

  } catch (error) {
    console.error('Export data failed:', error);
    res.status(500).json({
      success: false,
      message: 'Export data failed',
      error: error.message
    });
  }
});

// Get single biomarker details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting biomarker details:', id);

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid biomarker ID'
      });
    }

    const query = `
      SELECT 
        ID as id,
        Biomarker as biomarker,
        Category as category,
        String_Name as string_name,
        STRING_ID as string_id,
        Discription as description,
        Region as region,
        Race as race,
        Number as number,
        Male as male,
        Female as female,
        \`Gender_M/F\` as gender_ratio,
        Age_Mean as age_mean,
        Age as age,
        Location as location,
        Stage as stage,
        Source as source,
        Experiment as experiment,
        Statictics as statistics,
        Application as application,
        Clinical_Use as clinical_use,
        Conclusion as conclusion,
        Reference_first_author as reference_first_author,
        Reference_journal as reference_journal,
        Reference_year as reference_year,
        PMID as pmid,
        Addition as addition,
        Target as target,
        Drugs as drugs
      FROM biomarker 
      WHERE ID = ?
    `;

    const result = await db.query(query, [id]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Biomarker not found'
      });
    }

    const row = result[0];
    const biomarker = {
      id: row.id,
      biomarker: row.biomarker,
      category: row.category,
      string_name: row.string_name,
      string_id: row.string_id,
      description: row.description,
      region: row.region,
      race: row.race,
      number: row.number,
      male: row.male,
      female: row.female,
      gender_ratio: row.gender_ratio,
      age_mean: row.age_mean,
      age: row.age,
      location: row.location,
      stage: row.stage,
      source: row.source,
      experiment: row.experiment,
      statistics: row.statistics,
      application: row.application,
      clinical_use: row.clinical_use,
      conclusion: row.conclusion,
      target: row.target,
      drugs: row.drugs,
      pmid: row.pmid,
      addition: row.addition,
      reference: {
        author: row.reference_first_author,
        journal: row.reference_journal,
        year: row.reference_year
      }
    };

    console.log('Returning biomarker details:', biomarker);

    res.json({
      success: true,
      data: biomarker
    });

  } catch (error) {
    console.error('Failed to get biomarker details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get biomarker details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get filter options
router.get('/filters/options', async (req, res) => {
  try {
    console.log('Getting filter options');

    const queries = {
      categories: 'SELECT DISTINCT Category as value FROM biomarker WHERE Category IS NOT NULL AND Category != "" ORDER BY Category',
      sources: 'SELECT DISTINCT Source as value FROM biomarker WHERE Source IS NOT NULL AND Source != "" ORDER BY Source',
      regions: 'SELECT DISTINCT Region as value FROM biomarker WHERE Region IS NOT NULL AND Region != "" ORDER BY Region',
      stages: 'SELECT DISTINCT Stage as value FROM biomarker WHERE Stage IS NOT NULL AND Stage != "" ORDER BY Stage',
      races: 'SELECT DISTINCT Race as value FROM biomarker WHERE Race IS NOT NULL AND Race != "" ORDER BY Race',
      experiments: 'SELECT DISTINCT Experiment as value FROM biomarker WHERE Experiment IS NOT NULL AND Experiment != "" ORDER BY Experiment'
    };

    const results = {};

    for (const [key, query] of Object.entries(queries)) {
      try {
        const rows = await db.query(query);
        results[key] = rows.map(row => row.value).filter(value => value && value.trim());
      } catch (error) {
        console.error(`Failed to get ${key} options:`, error);
        results[key] = [];
      }
    }

    console.log('Filter options result:', results);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Failed to get filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get filter options',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get statistics information
router.get('/stats/overview', async (req, res) => {
  try {
    console.log('Getting statistics information');

    const queries = {
      total: 'SELECT COUNT(*) as count FROM biomarker',
      categories: 'SELECT Category, COUNT(*) as count FROM biomarker WHERE Category IS NOT NULL GROUP BY Category ORDER BY count DESC',
      sources: 'SELECT Source, COUNT(*) as count FROM biomarker WHERE Source IS NOT NULL GROUP BY Source ORDER BY count DESC',
      regions: 'SELECT Region, COUNT(*) as count FROM biomarker WHERE Region IS NOT NULL GROUP BY Region ORDER BY count DESC',
      clinical_use: 'SELECT Clinical_Use, COUNT(*) as count FROM biomarker WHERE Clinical_Use IS NOT NULL GROUP BY Clinical_Use',
      targets: 'SELECT Target, COUNT(*) as count FROM biomarker WHERE Target IS NOT NULL GROUP BY Target'
    };

    const results = {};

    for (const [key, query] of Object.entries(queries)) {
      try {
        const rows = await db.query(query);
        if (key === 'total') {
          results[key] = rows[0]?.count || 0;
        } else {
          results[key] = rows;
        }
      } catch (error) {
        console.error(`Failed to get ${key} statistics:`, error);
        results[key] = key === 'total' ? 0 : [];
      }
    }

    console.log('Statistics information result:', results);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Failed to get statistics information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics information',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add download endpoint
router.get('/download', async (req, res) => {
  try {
    const {
      format = 'csv',
      fields = 'biomarker,category,disease,sample_type,detection_method,sensitivity,specificity,reference_year',
      biomarker,
      category,
      disease,
      sample_type,
      detection_method,
      year_from,
      year_to,
      sensitivity_min,
      sensitivity_max,
      specificity_min,
      specificity_max,
      hasSequence,
      hasStructure,
      validated,
      clinicalTrial
    } = req.query;

    // Build WHERE clause
    let whereClause = '1=1';
    const params = [];

    if (biomarker) {
      whereClause += ' AND Biomarker LIKE ?';
      params.push(`%${biomarker}%`);
    }

    if (category) {
      whereClause += ' AND Category = ?';
      params.push(category);
    }

    if (disease) {
      whereClause += ' AND Disease LIKE ?';
      params.push(`%${disease}%`);
    }

    if (sample_type) {
      whereClause += ' AND Sample_type = ?';
      params.push(sample_type);
    }

    if (detection_method) {
      whereClause += ' AND Detection_method = ?';
      params.push(detection_method);
    }

    if (year_from) {
      whereClause += ' AND Reference_year >= ?';
      params.push(year_from);
    }

    if (year_to) {
      whereClause += ' AND Reference_year <= ?';
      params.push(year_to);
    }

    if (sensitivity_min) {
      whereClause += ' AND Sensitivity >= ?';
      params.push(sensitivity_min);
    }

    if (sensitivity_max) {
      whereClause += ' AND Sensitivity <= ?';
      params.push(sensitivity_max);
    }

    if (specificity_min) {
      whereClause += ' AND Specificity >= ?';
      params.push(specificity_min);
    }

    if (specificity_max) {
      whereClause += ' AND Specificity <= ?';
      params.push(specificity_max);
    }

    if (validated === 'true') {
      whereClause += ' AND Clinical_Use = ?';
      params.push('Yes');
    }

    // Build SELECT clause
    const fieldMap = {
      'biomarker': 'Biomarker',
      'category': 'Category',
      'disease': 'Disease',
      'sample_type': 'Sample_type',
      'detection_method': 'Detection_method',
      'sensitivity': 'Sensitivity',
      'specificity': 'Specificity',
      'reference_year': 'Reference_year',
      'reference': 'Reference',
      'description': 'Discription',
      'function': 'Function',
      'sequence': 'Sequence',
      'structure': 'Structure'
    };

    const selectedFields = fields.split(',').map(field => fieldMap[field.trim()] || field.trim());
    const selectClause = selectedFields.join(', ');

    const query = `SELECT ${selectClause} FROM biomarkers WHERE ${whereClause} ORDER BY ID DESC`;

    const results = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Set appropriate headers for download
    if (format === 'excel') {
      // Create Excel workbook
      const XLSX = require('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(results);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Biomarkers');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="biomarkers_export.xlsx"');
      res.send(buffer);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="biomarkers_export.json"');
      res.json(results);
    } else {
      // Default to CSV
      const csv = convertToCSV(results);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="biomarkers_export.csv"');
      res.send(csv);
    }

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Download failed',
      error: error.message
    });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma or quote
      if (value && (value.toString().includes(',') || value.toString().includes('"'))) {
        return `"${value.toString().replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

// Get filter options (for Download page)
router.get('/filter-options', async (req, res) => {
  try {
    console.log('Getting filter options for Download page');

    // Get all distinct categories
    const categories = await db.query(`
      SELECT DISTINCT Category as value 
      FROM biomarker 
      WHERE Category IS NOT NULL AND Category != ''
      ORDER BY Category
    `);

    // Get all distinct application types
    const applications = await db.query(`
      SELECT DISTINCT Application as value 
      FROM biomarker 
      WHERE Application IS NOT NULL AND Application != ''
      ORDER BY Application
    `);

    // Get all distinct locations
    const locations = await db.query(`
      SELECT DISTINCT Location as value 
      FROM biomarker 
      WHERE Location IS NOT NULL AND Location != ''
      ORDER BY Location
    `);

    // Get all distinct sample sources
    const sources = await db.query(`
      SELECT DISTINCT Source as value 
      FROM biomarker 
      WHERE Source IS NOT NULL AND Source != ''
      ORDER BY Source
    `);

    // Get all distinct research regions
    const regions = await db.query(`
      SELECT DISTINCT Region as value 
      FROM biomarker 
      WHERE Region IS NOT NULL AND Region != ''
      ORDER BY Region
    `);

    // Get all distinct disease stages
    const stages = await db.query(`
      SELECT DISTINCT Stage as value 
      FROM biomarker 
      WHERE Stage IS NOT NULL AND Stage != ''
      ORDER BY Stage
    `);

    // Get year range
    const yearRange = await db.query(`
      SELECT 
        MIN(Reference_year) as min_year,
        MAX(Reference_year) as max_year
      FROM biomarker 
      WHERE Reference_year IS NOT NULL AND Reference_year > 0
    `);

    const result = {
      categories: categories.map(row => row.value),
      applications: applications.map(row => row.value),
      locations: locations.map(row => row.value),
      sources: sources.map(row => row.value),
      regions: regions.map(row => row.value),
      stages: stages.map(row => row.value),
      yearRange: {
        min: yearRange[0]?.min_year || 2000,
        max: yearRange[0]?.max_year || new Date().getFullYear()
      }
    };

    console.log('Filter options retrieved successfully:', result);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Failed to get filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get filter options',
      error: error.message
    });
  }
});

// Filter biomarkers (for Download page preview)
router.get('/filter', async (req, res) => {
  try {
    console.log('Filter biomarkers request parameters:', req.query);

    const {
      page = 1,
      limit = 20,
      name,
      category,
      application,
      location,
      source,
      yearRange,
      region,
      stage
    } = req.query;

    // Parameter validation
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build query conditions
    let whereConditions = [];
    let queryParams = [];

    // Name search
    if (name && name.trim()) {
      whereConditions.push('Biomarker LIKE ?');
      queryParams.push(`%${name.trim()}%`);
    }

    // Category filter
    if (category && Array.isArray(category) && category.length > 0) {
      const placeholders = category.map(() => '?').join(',');
      whereConditions.push(`Category IN (${placeholders})`);
      queryParams.push(...category);
    }

    // Application type filter
    if (application && Array.isArray(application) && application.length > 0) {
      const appConditions = application.map(() => 'Application LIKE ?').join(' OR ');
      whereConditions.push(`(${appConditions})`);
      queryParams.push(...application.map(app => `%${app}%`));
    }

    // Location filter
    if (location && Array.isArray(location) && location.length > 0) {
      const locConditions = location.map(() => 'Location LIKE ?').join(' OR ');
      whereConditions.push(`(${locConditions})`);
      queryParams.push(...location.map(loc => `%${loc}%`));
    }

    // Sample source filter
    if (source && Array.isArray(source) && source.length > 0) {
      const placeholders = source.map(() => '?').join(',');
      whereConditions.push(`Source IN (${placeholders})`);
      queryParams.push(...source);
    }

    // Year range filter
    if (yearRange && Array.isArray(yearRange) && yearRange.length === 2) {
      whereConditions.push('Reference_year BETWEEN ? AND ?');
      queryParams.push(yearRange[0], yearRange[1]);
    }

    // Research region filter
    if (region && Array.isArray(region) && region.length > 0) {
      const placeholders = region.map(() => '?').join(',');
      whereConditions.push(`Region IN (${placeholders})`);
      queryParams.push(...region);
    }

    // Disease stage filter
    if (stage && Array.isArray(stage) && stage.length > 0) {
      const stageConditions = stage.map(() => 'Stage LIKE ?').join(' OR ');
      whereConditions.push(`(${stageConditions})`);
      queryParams.push(...stage.map(s => `%${s}%`));
    }

    const whereClause = whereConditions.length > 0 ?
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM biomarker ${whereClause}`;
    console.log('Filter statistics SQL:', countQuery, 'Parameters:', queryParams);

    const countResult = await db.query(countQuery, queryParams);
    const total = countResult[0]?.total || 0;

    // Get data
    const dataQuery = `
      SELECT 
        ID as id,
        Biomarker as name,
        Category as category,
        Application as application,
        Location as location,
        Source as source,
        Discription as description,
        Reference_first_author as first_author,
        Reference_journal as journal,
        Reference_year as publication_year,
        PMID as pmid,
        Region as region,
        Stage as stage
      FROM biomarker 
      ${whereClause}
      ORDER BY ID DESC
      LIMIT ? OFFSET ?
    `;

    const dataParams = [...queryParams, limitNum, offset];
    console.log('Filter data SQL:', dataQuery, 'Parameters:', dataParams);

    const data = await db.query(dataQuery, dataParams);

    console.log(`Filter successful: Total=${total}, Current page data=${data?.length || 0}`);

    res.json({
      success: true,
      data: data || [],
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Failed to filter biomarkers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to filter data',
      error: error.message
    });
  }
});

// Get statistics data (for Download page)
router.get('/stats', async (req, res) => {
  try {
    console.log('Getting statistics data');

    // Get total record count
    const totalResult = await db.query('SELECT COUNT(*) as total FROM biomarker');
    const totalRecords = totalResult[0]?.total || 0;

    // Simulate download count (should have download record table in actual project)
    const downloadCount = Math.floor(totalRecords * 0.1); // Assume download count is 10% of records

    // Get last update time (if there's an update time field)
    const lastUpdate = new Date().toISOString();

    const result = {
      totalRecords,
      downloadCount,
      lastUpdate
    };

    console.log('Statistics data retrieved successfully:', result);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Failed to get statistics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics data',
      error: error.message
    });
  }
});

// Download data
router.post('/download', async (req, res) => {
  try {
    console.log('Download data request:', req.body);

    const { filters = {}, fields = [], format = 'csv' } = req.body;

    // Build query conditions (reuse filter logic)
    let whereConditions = [];
    let queryParams = [];

    // Name search
    if (filters.name && filters.name.trim()) {
      whereConditions.push('Biomarker LIKE ?');
      queryParams.push(`%${filters.name.trim()}%`);
    }

    // Category filter
    if (filters.category && Array.isArray(filters.category) && filters.category.length > 0) {
      const placeholders = filters.category.map(() => '?').join(',');
      whereConditions.push(`Category IN (${placeholders})`);
      queryParams.push(...filters.category);
    }

    // Application type filter
    if (filters.application && Array.isArray(filters.application) && filters.application.length > 0) {
      const appConditions = filters.application.map(() => 'Application LIKE ?').join(' OR ');
      whereConditions.push(`(${appConditions})`);
      queryParams.push(...filters.application.map(app => `%${app}%`));
    }

    // Location filter
    if (filters.location && Array.isArray(filters.location) && filters.location.length > 0) {
      const locConditions = filters.location.map(() => 'Location LIKE ?').join(' OR ');
      whereConditions.push(`(${locConditions})`);
      queryParams.push(...filters.location.map(loc => `%${loc}%`));
    }

    // Sample source filter
    if (filters.source && Array.isArray(filters.source) && filters.source.length > 0) {
      const placeholders = filters.source.map(() => '?').join(',');
      whereConditions.push(`Source IN (${placeholders})`);
      queryParams.push(...filters.source);
    }

    // Year range filter
    if (filters.yearRange && Array.isArray(filters.yearRange) && filters.yearRange.length === 2) {
      whereConditions.push('Reference_year BETWEEN ? AND ?');
      queryParams.push(filters.yearRange[0], filters.yearRange[1]);
    }

    // Research region filter
    if (filters.region && Array.isArray(filters.region) && filters.region.length > 0) {
      const placeholders = filters.region.map(() => '?').join(',');
      whereConditions.push(`Region IN (${placeholders})`);
      queryParams.push(...filters.region);
    }

    // Disease stage filter
    if (filters.stage && Array.isArray(filters.stage) && filters.stage.length > 0) {
      const stageConditions = filters.stage.map(() => 'Stage LIKE ?').join(' OR ');
      whereConditions.push(`(${stageConditions})`);
      queryParams.push(...filters.stage.map(s => `%${s}%`));
    }

    const whereClause = whereConditions.length > 0 ?
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // Build field list
    const fieldMap = {
      'name': 'Biomarker',
      'category': 'Category',
      'application': 'Application',
      'location': 'Location',
      'source': 'Source',
      'description': 'Discription',
      'first_author': 'Reference_first_author',
      'journal': 'Reference_journal',
      'publication_year': 'Reference_year',
      'pmid': 'PMID',
      'region': 'Region',
      'stage': 'Stage'
    };

    const selectedFields = fields.length > 0
      ? fields.filter(field => fieldMap[field]).map(field => `${fieldMap[field]} as ${field}`)
      : ['Biomarker as name', 'Category as category', 'Application as application', 'Reference_year as publication_year'];

    // Get data
    const dataQuery = `
      SELECT ${selectedFields.join(', ')}
      FROM biomarker 
      ${whereClause}
      ORDER BY ID DESC
    `;

    console.log('Download data SQL:', dataQuery, 'Parameters:', queryParams);

    const data = await db.query(dataQuery, queryParams);

    console.log(`Download data retrieved successfully: ${data?.length || 0} records`);

    // Generate CSV format data
    if (format === 'csv') {
      // Field name mapping
      const fieldNames = {
        name: 'Biomarker Name',
        category: 'Category',
        application: 'Application',
        location: 'Location',
        source: 'Sample Source',
        description: 'Description',
        first_author: 'First Author',
        journal: 'Journal',
        publication_year: 'Publication Year',
        pmid: 'PubMed ID',
        region: 'Research Region',
        stage: 'Disease Stage'
      };

      // Generate CSV header
      const headers = fields.length > 0 ? fields.map(field => fieldNames[field] || field) : ['Biomarker Name', 'Category', 'Application', 'Publication Year'];
      let csvContent = headers.join(',') + '\n';

      // Generate CSV data rows
      if (data && data.length > 0) {
        data.forEach(row => {
          const values = Object.values(row).map(value => {
            if (value === null || value === undefined) return '';
            let strValue = value.toString();
            // Handle values containing commas or quotes
            if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
              strValue = '"' + strValue.replace(/"/g, '""') + '"';
            }
            return strValue;
          });
          csvContent += values.join(',') + '\n';
        });
      }

      // Set response headers
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="cbd_biomarkers_${new Date().toISOString().split('T')[0]}.csv"`);

      // Add BOM to support correct Chinese display in Excel
      res.write('\uFEFF');
      res.end(csvContent);
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported file format'
      });
    }

  } catch (error) {
    console.error('Failed to download data:', error);
    res.status(500).json({
      success: false,
      message: 'Download failed',
      error: error.message
    });
  }
});


module.exports = router;
