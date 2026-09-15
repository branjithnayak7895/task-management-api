const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  username: {
    type: String,
    default: 'System/Guest'
  },
  action: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    enum: ['Task', 'Project', 'User', 'Team', 'Sprint', 'Webhook', 'System'],
    default: 'Task'
  },
  targetId: {
    type: String
  },
  details: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
