const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { getAuditLogs } = require('../controllers/auditController');

router.use(protect);

// Accessible by admin or member for demo convenience
router.get('/', getAuditLogs);

module.exports = router;
