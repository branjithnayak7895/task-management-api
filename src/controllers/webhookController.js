const Webhook = require('../models/Webhook');
const logAudit = require('../middleware/auditLogger');

exports.getWebhooks = async (req, res) => {
  try {
    const webhooks = await Webhook.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: webhooks.length, data: webhooks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createWebhook = async (req, res) => {
  try {
    const { name, url, events } = req.body;
    const webhook = await Webhook.create({
      name,
      url,
      events: events || ['task.completed'],
      user: req.user._id
    });
    await logAudit(req, 'CREATE_WEBHOOK', 'Webhook', webhook._id, `Registered webhook: ${name}`);
    res.status(201).json({ success: true, data: webhook });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.testWebhook = async (req, res) => {
  try {
    const webhook = await Webhook.findOne({ _id: req.params.id, user: req.user._id });
    if (!webhook) return res.status(404).json({ success: false, message: 'Webhook not found' });

    webhook.lastTriggered = new Date();
    await webhook.save();

    const mockPayload = {
      event: 'task.completed',
      timestamp: new Date().toISOString(),
      webhookId: webhook._id,
      sampleData: { taskId: 'sample_123', status: 'completed' }
    };

    await logAudit(req, 'TEST_WEBHOOK', 'Webhook', webhook._id, `Dispatched test payload to ${webhook.url}`);
    res.status(200).json({
      success: true,
      message: `Simulated webhook payload successfully dispatched to ${webhook.url}`,
      payload: mockPayload
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteWebhook = async (req, res) => {
  try {
    const webhook = await Webhook.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!webhook) return res.status(404).json({ success: false, message: 'Webhook not found' });
    await logAudit(req, 'DELETE_WEBHOOK', 'Webhook', req.params.id, `Deleted webhook`);
    res.status(200).json({ success: true, message: 'Webhook deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
