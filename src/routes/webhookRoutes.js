const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWebhooks,
  createWebhook,
  testWebhook,
  deleteWebhook
} = require('../controllers/webhookController');

router.use(protect);

router.route('/')
  .get(getWebhooks)
  .post(createWebhook);

router.post('/:id/test', testWebhook);
router.delete('/:id', deleteWebhook);

module.exports = router;
