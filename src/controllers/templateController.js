const TaskTemplate = require('../models/TaskTemplate');
const Task = require('../models/Task');
const logAudit = require('../middleware/auditLogger');

exports.getTemplates = async (req, res) => {
  try {
    let templates = await TaskTemplate.find();
    if (templates.length === 0) {
      // Seed default system templates if empty
      templates = await TaskTemplate.insertMany([
        {
          name: 'Software Bug Report Template',
          category: 'Engineering',
          defaultPriority: 'high',
          defaultSubtasks: [{ title: 'Reproduce bug locally' }, { title: 'Write failing unit test' }, { title: 'Implement patch' }, { title: 'Verify in staging' }],
          defaultTags: ['bug', 'engineering', 'qa']
        },
        {
          name: 'New Feature Onboarding Template',
          category: 'Product',
          defaultPriority: 'medium',
          defaultSubtasks: [{ title: 'Draft PRD spec' }, { title: 'Design Figma mockup' }, { title: 'API schema review' }],
          defaultTags: ['feature', 'design', 'product']
        }
      ]);
    }
    res.status(200).json({ success: true, count: templates.length, data: templates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const template = await TaskTemplate.create({ ...req.body, createdBy: req.user._id });
    await logAudit(req, 'CREATE_TEMPLATE', 'TaskTemplate', template._id, `Created template: ${template.name}`);
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.instantiateTemplate = async (req, res) => {
  try {
    const template = await TaskTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });

    const newTask = await Task.create({
      title: req.body.customTitle || `[From Template] ${template.name}`,
      description: req.body.description || template.description || 'Instantiated from task template',
      priority: template.defaultPriority,
      tags: template.defaultTags,
      subtasks: template.defaultSubtasks,
      user: req.user._id,
      category: 'work'
    });

    await logAudit(req, 'INSTANTIATE_TEMPLATE', 'Task', newTask._id, `Created task from template: ${template.name}`);
    res.status(201).json({ success: true, data: newTask });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
