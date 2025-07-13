const Room = require('../models/Room');

exports.createRoom = async (req, res) => {
  try {
    const { name, isPrivate, userId } = req.body;
    const room = new Room({ name, isPrivate, members: [userId], owner: userId });
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

// Delete a room (only owner)
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only the owner can delete this room' });
    }
    await room.deleteOne();
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Leave a room (any member)
exports.leaveRoom = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    room.members = room.members.filter(memberId => memberId.toString() !== userId);
    await room.save();
    res.json({ message: 'Left the room successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all public rooms (not private)
exports.getPublicRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 