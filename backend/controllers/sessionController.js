const Session = require('../models/sessionModel');
const generateSessionCode = require('../utils/generateCode');

// @desc    Create a new session
// @route   POST /api/sessions/create
// @access  Private
const createSession = async (req, res) => {
  try {
    console.log('User creating session:', req.user._id);
    const session = await Session.create({
      mentorId: req.user._id,
      sessionCode: generateSessionCode(),
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('SERVER SESSION CREATE ERROR:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Join a session by code
// @route   POST /api/sessions/join
// @access  Private
const joinSession = async (req, res) => {
  const { code } = req.body;

  try {
    const session = await Session.findOne({ sessionCode: code });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.status === 'ended') {
      return res.status(400).json({ message: 'Session has already ended' });
    }

    // If joining as second person (student)
    if (session.mentorId.toString() !== req.user._id.toString() && !session.studentId) {
        session.studentId = req.user._id;
        await session.save();
    }

    res.json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get session details by ID or Code
// @route   GET /api/sessions/:id
// @access  Private
const getSessionDetails = async (req, res) => {
  try {
    // Try finding by internal ID or by sessionCode
    let session = await Session.findOne({ 
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { sessionCode: req.params.id }] 
    })
      .populate('mentorId', 'name email')
      .populate('studentId', 'name email');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Authorization check
    const isMentor = session.mentorId._id.toString() === req.user._id.toString();
    const isStudent = session.studentId?._id.toString() === req.user._id.toString();

    if (!isMentor && !isStudent && session.studentId) {
      return res.status(403).json({ message: 'Not authorized to view this session' });
    }

    res.json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createSession, joinSession, getSessionDetails };
