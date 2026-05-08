const express = require('express');
const router = express.Router();
const Notification = require('../../models/Notification');
const { ownerProtect } = require('../../middleware/auth');

router.get('/', ownerProtect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientType: 'owner', recipient: req.owner._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ 
      recipientType: 'owner', 
      recipient: req.owner._id, 
      isRead: false 
    });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

router.put('/:id/read', ownerProtect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

router.put('/read-all', ownerProtect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientType: 'owner', recipient: req.owner._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
});

router.delete('/:id', ownerProtect, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
});

module.exports = router;