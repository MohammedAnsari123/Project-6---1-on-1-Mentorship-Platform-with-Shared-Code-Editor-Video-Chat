const express = require('express');
const {
  createSession,
  joinSession,
  getSessionDetails,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/create', protect, createSession);
router.post('/join', protect, joinSession);
router.get('/:id', protect, getSessionDetails);

module.exports = router;
