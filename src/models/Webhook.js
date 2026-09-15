const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  events: [{
    type: String,
    enum: ['task.created', 'task.updated', 'task.completed', 'task.deleted', 'project.created']
  }],
  secret: {
    type: String,
    default: 'whsec_demo_secret_key_12345'
  },
  active: {
    type: Boolean,
    default: true
  },
  lastTriggered: {
    type: Date
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Webhook', webhookSchema);
