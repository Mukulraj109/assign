const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Mock QC data storage
let qcRecords = [];

// Complete Level 1 QC
router.post('/level1/:shipmentId/complete', authenticateToken, (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { notes, checks } = req.body;
    
    const qcRecord = {
      id: Date.now().toString(),
      shipmentId,
      level: 1,
      inspectorId: req.user.id,
      inspectorName: req.user.name || req.user.username,
      notes,
      checks,
      completedAt: new Date().toISOString(),
      status: 'completed'
    };
    
    qcRecords.push(qcRecord);
    
    res.json({
      message: 'Level 1 QC completed successfully',
      qcRecord
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete Level 1 QC' });
  }
});

// Complete Level 2 QC for an item
router.post('/level2/:shipmentId/items/:itemId/complete', authenticateToken, (req, res) => {
  try {
    const { shipmentId, itemId } = req.params;
    const { checks, actualQuantity, issues } = req.body;
    
    const qcRecord = {
      id: Date.now().toString(),
      shipmentId,
      itemId,
      level: 2,
      inspectorId: req.user.id,
      inspectorName: req.user.name || req.user.username,
      checks,
      actualQuantity,
      issues: issues || [],
      completedAt: new Date().toISOString(),
      status: 'completed'
    };
    
    qcRecords.push(qcRecord);
    
    res.json({
      message: 'Level 2 QC completed for item',
      qcRecord
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete Level 2 QC' });
  }
});

// Upload QC photos
router.post('/photos/:shipmentId', authenticateToken, upload.array('photos', 5), (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { itemId, checkType } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const photoUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    const photoRecord = {
      id: Date.now().toString(),
      shipmentId,
      itemId: itemId || null,
      checkType: checkType || 'general',
      photos: photoUrls,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString()
    };
    
    // In a real app, save this to database
    console.log('Photo record:', photoRecord);
    
    res.json({
      message: 'Photos uploaded successfully',
      photos: photoUrls
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// Get QC history for a shipment
router.get('/history/:shipmentId', authenticateToken, (req, res) => {
  try {
    const { shipmentId } = req.params;
    const shipmentQC = qcRecords.filter(record => record.shipmentId === shipmentId);
    
    res.json({
      shipmentId,
      qcHistory: shipmentQC
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch QC history' });
  }
});

// Get QC statistics
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let filteredRecords = qcRecords;
    
    if (startDate && endDate) {
      filteredRecords = qcRecords.filter(record => {
        const recordDate = new Date(record.completedAt);
        return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
      });
    }
    
    const stats = {
      totalQCRecords: filteredRecords.length,
      level1Records: filteredRecords.filter(r => r.level === 1).length,
      level2Records: filteredRecords.filter(r => r.level === 2).length,
      byInspector: {},
      byDate: {}
    };
    
    // Group by inspector
    filteredRecords.forEach(record => {
      const inspector = record.inspectorName;
      if (!stats.byInspector[inspector]) {
        stats.byInspector[inspector] = 0;
      }
      stats.byInspector[inspector]++;
    });
    
    // Group by date
    filteredRecords.forEach(record => {
      const date = new Date(record.completedAt).toDateString();
      if (!stats.byDate[date]) {
        stats.byDate[date] = 0;
      }
      stats.byDate[date]++;
    });
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch QC statistics' });
  }
});

module.exports = router;