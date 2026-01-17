const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Debug: Check if CloudPrinter API key is loaded
console.log('🔍 Checking CLOUD_PRINTER_KEY:', process.env.CLOUD_PRINTER_KEY ? '✅ Found' : '❌ Missing');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware - CSP disabled to allow all external connections
app.use(helmet({
    contentSecurityPolicy: false // Disabled - was blocking external APIs
}));

// CORS Configuration - Whitelist React app origin
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// Health Check Routes (for Docker and monitoring)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'alwaleed-backend'
    });
});

// Legacy health check (keep for backward compatibility)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/photos', require('./routes/photos'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/process-image', require('./routes/process-image'));
app.use('/api/cloudprinter', require('./routes/cloudprinter'));
app.use('/api/paylink', require('./routes/paylink'));
app.use('/api/print-orders', require('./routes/printOrders'));

// Production: Serve static frontend files from dist/
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../dist');

    // Serve static assets
    app.use(express.static(distPath));

    // Serve index.html for all non-API routes (SPA routing)
    app.use((req, res, next) => {
        // Skip API routes
        if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
            return next();
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    // 404 Handler for development (when using separate Vite dev server)
    app.use((req, res) => {
        res.status(404).json({ error: 'Route not found' });
    });
}

// Error Handler (must be last)
app.use(errorHandler);

// Start Server - Bind to 0.0.0.0 for Docker networking
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
