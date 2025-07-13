const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { room, sender, content, type, fileUrl } = req.body;
    const message = new Message({ room, sender, content, type, fileUrl });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ room: roomId }).sort({ createdAt: 1 }).populate('sender', 'username avatar');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 