/**
 * Echo Chamber Web Server
 * 
 * Provides a beautiful web interface for sequence analysis
 * Built with Express.js and pure HTML/CSS/JavaScript (no frontend frameworks)
 */

const express = require('express');
const path = require('path');
const SequenceAnalyzer = require('./SequenceAnalyzer');
const Logger = require('./Logger');

const app = express();
const analyzer = new SequenceAnalyzer();
const logger = new Logger();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ============================================================================
// API Routes
// ============================================================================

/**
 * POST /api/analyze
 * Analyzes a sequence and returns pattern detection results
 */
app.post('/api/analyze', (req, res) => {
  try {
    const { sequence } = req.body;

    if (!Array.isArray(sequence)) {
      logger.warn('Invalid sequence format received');
      return res.status(400).json({
        success: false,
        error: 'Sequence must be an array of numbers'
      });
    }

    const result = analyzer.analyze(sequence);
    
    if (!result.success) {
      logger.warn('Sequence analysis failed', { error: result.error });
      return res.status(400).json(result);
    }

    logger.info('Sequence analyzed successfully', { 
      pattern: result.pattern,
      length: sequence.length 
    });

    res.json(result);
  } catch (error) {
    logger.error('Analysis endpoint error', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during analysis'
    });
  }
});

/**
 * GET /api/history
 * Returns the history of all analyzed sequences
 */
app.get('/api/history', (req, res) => {
  try {
    const history = analyzer.getHistory();
    logger.info('History retrieved', { count: history.length });
    res.json({
      success: true,
      history: history,
      count: history.length
    });
  } catch (error) {
    logger.error('History endpoint error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve history'
    });
  }
});

/**
 * GET /api/metrics
 * Returns performance metrics
 */
app.get('/api/metrics', (req, res) => {
  try {
    const metrics = analyzer.getMetrics();
    res.json({
      success: true,
      metrics: metrics
    });
  } catch (error) {
    logger.error('Metrics endpoint error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics'
    });
  }
});

/**
 * POST /api/compare
 * Compares two sequences
 */
app.post('/api/compare', (req, res) => {
  try {
    const { sequence1, sequence2 } = req.body;

    if (!Array.isArray(sequence1) || !Array.isArray(sequence2)) {
      return res.status(400).json({
        success: false,
        error: 'Both sequences must be arrays of numbers'
      });
    }

    const result = analyzer.comparSequences(sequence1, sequence2);
    logger.info('Sequences compared', { 
      samePattern: result.samePattern,
      similarity: result.similarity 
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Comparison endpoint error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare sequences'
    });
  }
});

/**
 * DELETE /api/history
 * Clears all history and cache
 */
app.delete('/api/history', (req, res) => {
  try {
    analyzer.clear();
    logger.info('History cleared');
    res.json({
      success: true,
      message: 'All history and cache cleared'
    });
  } catch (error) {
    logger.error('Clear history endpoint error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear history'
    });
  }
});

/**
 * GET /api/logs
 * Returns recent log entries
 */
app.get('/api/logs', (req, res) => {
  try {
    const logs = logger.readLog();
    const lines = logs.split('\n').slice(-50); // Last 50 lines
    res.json({
      success: true,
      logs: lines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve logs'
    });
  }
});

// ============================================================================
// Error Handling
// ============================================================================

/**
 * 404 Not Found Handler
 */
app.use((req, res) => {
  logger.warn(`Route not found: ${req.path}`);
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

/**
 * Error Handler
 */
app.use((error, req, res, next) => {
  logger.error('Unhandled error', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// ============================================================================
// Server Startup
// ============================================================================

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  logger.info(`🔮 Echo Chamber Web Server Started`, { 
    url: url,
    environment: process.env.NODE_ENV || 'development'
  });
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         🔮 ECHO CHAMBER WEB SERVER RUNNING 🔮            ║');
  console.log(`║              Open: ${url.padEnd(45)}║`);
  console.log('║                                                            ║');
  console.log('║  Available Routes:                                         ║');
  console.log('║  • POST   /api/analyze        - Analyze a sequence       ║');
  console.log('║  • GET    /api/history        - Get analysis history     ║');
  console.log('║  • GET    /api/metrics        - Get performance metrics  ║');
  console.log('║  • POST   /api/compare        - Compare two sequences    ║');
  console.log('║  • DELETE /api/history        - Clear all history        ║');
  console.log('║  • GET    /api/logs           - Get recent logs          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received - shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received - shutting down gracefully');
  process.exit(0);
});

module.exports = app;
