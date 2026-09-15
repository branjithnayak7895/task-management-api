const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const logAudit = require('../middleware/auditLogger');

exports.createSprint = async (req, res) => {
  try {
    const { name, goal, project, startDate, endDate } = req.body;
    const sprint = await Sprint.create({ name, goal, project, startDate, endDate });
    await logAudit(req, 'CREATE_SPRINT', 'Sprint', sprint._id, `Created sprint: ${sprint.name}`);
    res.status(201).json({ success: true, data: sprint });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find().populate('project', 'title').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: sprints.length, data: sprints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBurndown = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ success: false, message: 'Sprint not found' });

    const tasks = await Task.find({ sprint: sprint._id, isDeleted: false });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const remainingTasks = totalTasks - completedTasks;
    const totalEstHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const totalActualHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        sprint,
        totalTasks,
        completedTasks,
        remainingTasks,
        totalEstHours,
        totalActualHours,
        completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
