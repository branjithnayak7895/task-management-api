const Project = require('../models/Project');
const Task = require('../models/Task');
const logAudit = require('../middleware/auditLogger');

exports.createProject = async (req, res) => {
  try {
    const { title, description, color, icon, targetDate } = req.body;
    const project = await Project.create({
      title,
      description,
      color,
      icon,
      targetDate,
      owner: req.user._id,
      members: [req.user._id]
    });
    await logAudit(req, 'CREATE_PROJECT', 'Project', project._id, `Created project: ${project.title}`);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    }).populate('owner', 'username email').sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('members', 'username email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const tasks = await Task.find({ project: project._id, isDeleted: false });
    res.status(200).json({ success: true, data: { project, tasks } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await logAudit(req, 'UPDATE_PROJECT', 'Project', project._id, `Updated project: ${project.title}`);
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    await project.deleteOne();
    await logAudit(req, 'DELETE_PROJECT', 'Project', req.params.id, `Deleted project: ${project.title}`);
    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
