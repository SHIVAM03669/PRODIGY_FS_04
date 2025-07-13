const Room = require('../models/Room');

exports.createRoom = async (req, res) => {
  try {
    const { name, isPrivate, userId } = req.body;
    const room = new Room({ name, isPrivate, members: [userId] });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserRooms = async (req, res) => {
  try {
    const { userId } = req.params;
    const rooms = await Room.find({ members: userId });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 