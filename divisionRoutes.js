const express = require('express');
const Division = require('../models/division');
const router = express.Router();

// Create a new division
router.post('/', async (req, res) => {
  const { name, programId, batchId } = req.body;
  try {
    const division = new Division({ name, programId, batchId });
    await division.save();
    res.status(201).json({ message: 'Division created successfully', division });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all divisions
router.get('/', async (req, res) => {
  try {
    const divisions = await Division.find({})
      .populate('programId', 'name')
      .populate('batchId', 'startYear endYear');
    res.json(divisions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
