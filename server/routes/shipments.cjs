const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();

// Mock shipments database
let shipments = [
  {
    id: 'SH001',
    supplierName: 'TechCorp Industries',
    poNumber: 'PO-2024-001',
    receivedDate: new Date().toISOString(),
    expectedItems: 50,
    level1Status: 'pending',
    level2Status: 'pending',
    items: [
      {
        id: 'ITM001',
        name: 'Wireless Bluetooth Headphones',
        sku: 'WBH-001',
        expectedQuantity: 20,
        status: 'pending'
      },
      {
        id: 'ITM002',
        name: 'USB-C Charging Cable',
        sku: 'UCC-002',
        expectedQuantity: 30,
        status: 'pending'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SH002',
    supplierName: 'GlobalSupply Co.',
    poNumber: 'PO-2024-002',
    receivedDate: new Date(Date.now() - 86400000).toISOString(),
    expectedItems: 75,
    level1Status: 'pass',
    level2Status: 'in-progress',
    items: [
      {
        id: 'ITM003',
        name: 'Smartphone Case',
        sku: 'SPC-003',
        expectedQuantity: 25,
        status: 'pass'
      },
      {
        id: 'ITM004',
        name: 'Screen Protector',
        sku: 'SPR-004',
        expectedQuantity: 50,
        status: 'in-progress'
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SH003',
    supplierName: 'QuickTech Solutions',
    poNumber: 'PO-2024-003',
    receivedDate: new Date(Date.now() - 172800000).toISOString(),
    expectedItems: 100,
    level1Status: 'pass',
    level2Status: 'pass',
    items: [
      {
        id: 'ITM005',
        name: 'Power Bank',
        sku: 'PWB-005',
        expectedQuantity: 40,
        status: 'pass'
      },
      {
        id: 'ITM006',
        name: 'Car Charger',
        sku: 'CCH-006',
        expectedQuantity: 60,
        status: 'pass'
      }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Get all shipments
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, supplier, limit = 50, offset = 0 } = req.query;
    
    let filteredShipments = [...shipments];
    
    if (status) {
      filteredShipments = filteredShipments.filter(s => 
        s.level1Status === status || s.level2Status === status
      );
    }
    
    if (supplier) {
      filteredShipments = filteredShipments.filter(s => 
        s.supplierName.toLowerCase().includes(supplier.toLowerCase())
      );
    }
    
    const paginatedShipments = filteredShipments
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      shipments: paginatedShipments,
      total: filteredShipments.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

// Get shipment by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const shipment = shipments.find(s => s.id === req.params.id);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shipment' });
  }
});

// Create new shipment
router.post('/', authenticateToken, (req, res) => {
  try {
    const { supplierName, poNumber, expectedItems, items } = req.body;
    
    if (!supplierName || !poNumber || !expectedItems || !items) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newShipment = {
      id: uuidv4(),
      supplierName,
      poNumber,
      receivedDate: new Date().toISOString(),
      expectedItems,
      level1Status: 'pending',
      level2Status: 'pending',
      items: items.map(item => ({
        id: uuidv4(),
        ...item,
        status: 'pending'
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    shipments.push(newShipment);
    res.status(201).json(newShipment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

// Update shipment
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const shipmentIndex = shipments.findIndex(s => s.id === req.params.id);
    if (shipmentIndex === -1) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    const updatedShipment = {
      ...shipments[shipmentIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    shipments[shipmentIndex] = updatedShipment;
    res.json(updatedShipment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update shipment' });
  }
});

// Delete shipment
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const shipmentIndex = shipments.findIndex(s => s.id === req.params.id);
    if (shipmentIndex === -1) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    shipments.splice(shipmentIndex, 1);
    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete shipment' });
  }
});

module.exports = router;