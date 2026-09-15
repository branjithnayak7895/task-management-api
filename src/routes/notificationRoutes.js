const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllRead,
  createDemoNotification
} = require('../controllers/notificationController');

router.use(protect);

router.route('/')
  .get(getNotifications)
  .post(createDemoNotification);

router.put('/read-all', markAllRead);
router.put('/:id/read', markAsRead);

module.exports = router;
