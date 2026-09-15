const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, targetType, targetId, details = '') => {
  try {
    const user = req.user ? req.user._id : null;
    const username = req.user ? req.user.username : 'Guest/System';
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    await AuditLog.create({
      user,
      username,
      action,
      targetType,
      targetId: targetId ? targetId.toString() : undefined,
      details,
      ipAddress
    });
  } catch (err) {
    console.error('Audit logging error:', err.message);
  }
};

module.exports = logAudit;
