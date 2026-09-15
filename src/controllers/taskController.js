const Task = require('../models/Task');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      completed,
      status,
      priority,
      dueDate,
      category,
      tags,
      subtasks,
      estimatedHours,
      actualHours,
      isPinned,
      recurrence
    } = req.body;

    const task = await Task.create({
      title,
      description,
      completed,
      status: status || (completed ? 'completed' : 'todo'),
      priority,
      dueDate,
      category,
      tags: Array.isArray(tags) ? tags : [],
      subtasks: Array.isArray(subtasks) ? subtasks : [],
      estimatedHours: estimatedHours || 0,
      actualHours: actualHours || 0,
      isPinned: isPinned || false,
      recurrence: recurrence || 'none',
      user: req.userId,
      activityLog: [{ action: 'Task created' }]
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all tasks for logged in user (owned or shared) with pagination, filtering, search & sorting
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      completed,
      status,
      priority,
      category,
      tag,
      search,
      isPinned,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {
      $or: [{ user: req.userId }, { sharedWith: req.userId }],
      isDeleted: false
    };

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (category) {
      filter.category = category;
    }

    if (tag) {
      filter.tags = tag.toLowerCase();
    }

    if (isPinned !== undefined) {
      filter.isPinned = isPinned === 'true';
    }

    if (search) {
      filter.$and = [
        {
          $or: [{ user: req.userId }, { sharedWith: req.userId }]
        },
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      ];
      delete filter.$or;
    }

    const sort = { isPinned: -1 };
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const tasks = await Task.find(filter)
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .populate('user', 'name email')
      .populate('sharedWith', 'name email');

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      count: tasks.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      },
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ user: req.userId }, { sharedWith: req.userId }],
      isDeleted: false
    })
      .populate('user', 'name email')
      .populate('sharedWith', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or unauthorized'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update task by ID
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    let task = await Task.findOne({
      _id: req.params.id,
      $or: [{ user: req.userId }, { sharedWith: req.userId }],
      isDeleted: false
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or unauthorized'
      });
    }

    const {
      title,
      description,
      completed,
      status,
      priority,
      dueDate,
      category,
      tags,
      subtasks,
      estimatedHours,
      actualHours,
      isPinned,
      recurrence
    } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (category !== undefined) task.category = category;
    if (tags !== undefined) task.tags = tags;
    if (subtasks !== undefined) task.subtasks = subtasks;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (actualHours !== undefined) task.actualHours = actualHours;
    if (isPinned !== undefined) task.isPinned = isPinned;
    if (recurrence !== undefined) task.recurrence = recurrence;

    task.activityLog.push({ action: 'Task updated' });

    await task.save();

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete task permanently
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or unauthorized'
      });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted permanently',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Soft delete task (move to trash)
// @route   DELETE /api/tasks/:id/soft
// @access  Private
const softDeleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    task.isDeleted = true;
    task.activityLog.push({ action: 'Moved to trash' });
    await task.save();

    res.json({ success: true, message: 'Task moved to trash', data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Restore task from trash
// @route   POST /api/tasks/:id/restore
// @access  Private
const restoreTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId, isDeleted: true });
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found in trash' });
    }

    task.isDeleted = false;
    task.activityLog.push({ action: 'Restored from trash' });
    await task.save();

    res.json({ success: true, message: 'Task restored successfully', data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Comment text is required' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ user: req.userId }, { sharedWith: req.userId }],
      isDeleted: false
    });

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const user = await User.findById(req.userId);
    task.comments.push({ text, user: req.userId, userName: user ? user.name : 'Anonymous' });
    task.activityLog.push({ action: `Added comment: "${text.slice(0, 20)}..."` });
    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle pin status
// @route   PATCH /api/tasks/:id/pin
// @access  Private
const togglePinTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ user: req.userId }, { sharedWith: req.userId }]
    });

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    task.isPinned = !task.isPinned;
    task.activityLog.push({ action: task.isPinned ? 'Task pinned' : 'Task unpinned' });
    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Share task with another user by email
// @route   POST /api/tasks/:id/share
// @access  Private
const shareTask = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'User email is required' });
    }

    const recipient = await User.findOne({ email });
    if (!recipient) {
      return res.status(404).json({ success: false, error: 'User with this email not found' });
    }

    if (recipient._id.toString() === req.userId.toString()) {
      return res.status(400).json({ success: false, error: 'You cannot share a task with yourself' });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found or unauthorized' });
    }

    if (!task.sharedWith.includes(recipient._id)) {
      task.sharedWith.push(recipient._id);
      task.activityLog.push({ action: `Shared with ${recipient.email}` });
      await task.save();
    }

    res.json({
      success: true,
      message: `Task shared successfully with ${recipient.email}`,
      data: task
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get task activity audit log
// @route   GET /api/tasks/:id/activity
// @access  Private
const getTaskActivity = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ user: req.userId }, { sharedWith: req.userId }]
    }).select('title activityLog');

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.json({
      success: true,
      data: task.activityLog
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Import JSON array of tasks
// @route   POST /api/tasks/import
// @access  Private
const importTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide a non-empty array of task objects' });
    }

    const preparedTasks = tasks.map(t => ({
      title: t.title || 'Untitled Task',
      description: t.description || '',
      completed: !!t.completed,
      priority: t.priority || 'medium',
      category: t.category || 'personal',
      dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
      user: req.userId,
      activityLog: [{ action: 'Imported from JSON backup' }]
    }));

    const imported = await Task.insertMany(preparedTasks);

    res.status(201).json({
      success: true,
      message: `Successfully imported ${imported.length} tasks`,
      count: imported.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get task statistics & analytics pipeline
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const now = new Date();

    const stats = await Task.aggregate([
      {
        $match: {
          $or: [{ user: userObjectId }, { sharedWith: userObjectId }],
          isDeleted: false
        }
      },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                completed: {
                  $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
                },
                pending: {
                  $sum: { $cond: [{ $eq: ['$completed', false] }, 1, 0] }
                },
                overdue: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ['$completed', false] },
                          { $ne: ['$dueDate', null] },
                          { $lt: ['$dueDate', now] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },
                totalEstHours: { $sum: '$estimatedHours' },
                totalActHours: { $sum: '$actualHours' }
              }
            }
          ],
          byPriority: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    const overviewData = stats[0].overview[0] || {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      totalEstHours: 0,
      totalActHours: 0
    };
    const total = overviewData.total || 0;
    const completed = overviewData.completed || 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalTasks: total,
        completedTasks: completed,
        pendingTasks: overviewData.pending || 0,
        overdueTasks: overviewData.overdue || 0,
        completionRate: `${completionRate}%`,
        totalEstimatedHours: overviewData.totalEstHours || 0,
        totalActualHours: overviewData.totalActHours || 0,
        byPriority: stats[0].byPriority,
        byCategory: stats[0].byCategory
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Bulk complete all tasks or selected tasks
// @route   PATCH /api/tasks/bulk-complete
// @access  Private
const bulkCompleteTasks = async (req, res) => {
  try {
    const { taskIds } = req.body;
    const filter = { user: req.userId, completed: false, isDeleted: false };

    if (Array.isArray(taskIds) && taskIds.length > 0) {
      filter._id = { $in: taskIds };
    }

    const result = await Task.updateMany(filter, { $set: { completed: true, status: 'completed' } });

    res.json({
      success: true,
      message: `${result.modifiedCount} task(s) marked as completed`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Bulk delete completed tasks
// @route   DELETE /api/tasks/bulk-delete
// @access  Private
const bulkDeleteTasks = async (req, res) => {
  try {
    const result = await Task.deleteMany({ user: req.userId, completed: true });

    res.json({
      success: true,
      message: `${result.deletedCount} completed task(s) deleted`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add subtask to task
// @route   POST /api/tasks/:id/subtasks
// @access  Private
const addSubtask = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Subtask title is required' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ user: req.userId }, { sharedWith: req.userId }],
      isDeleted: false
    });

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    task.subtasks.push({ title, completed: false });
    task.activityLog.push({ action: `Added subtask "${title}"` });
    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle subtask completed status
// @route   PATCH /api/tasks/:id/subtasks/:subtaskId
// @access  Private
const toggleSubtask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ user: req.userId }, { sharedWith: req.userId }],
      isDeleted: false
    });

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, error: 'Subtask not found' });
    }

    subtask.completed = !subtask.completed;
    task.activityLog.push({ action: `Toggled subtask "${subtask.title}"` });
    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Start timer for task
// @route   POST /api/tasks/:id/time/start
// @access  Private
const startTimeTracker = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    task.timeLogs.push({ startTime: new Date() });
    task.activityLog.push({ action: 'Timer started' });
    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Stop timer for task
// @route   POST /api/tasks/:id/time/stop
// @access  Private
const stopTimeTracker = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    const openLog = task.timeLogs.find(log => !log.endTime);
    if (openLog) {
      openLog.endTime = new Date();
      openLog.durationSeconds = Math.round((openLog.endTime - openLog.startTime) / 1000);
      task.actualHours = (task.actualHours || 0) + Math.round((openLog.durationSeconds / 3600) * 10) / 10;
      task.activityLog.push({ action: `Timer stopped (${openLog.durationSeconds}s logged)` });
      await task.save();
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Eisenhower Matrix grouped tasks
// @route   GET /api/tasks/eisenhower
// @access  Private
const getEisenhowerMatrix = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId, isDeleted: false, completed: false });
    const matrix = {
      do: tasks.filter(t => t.priority === 'urgent' || t.priority === 'high'),
      schedule: tasks.filter(t => t.priority === 'medium' && t.dueDate),
      delegate: tasks.filter(t => t.priority === 'medium' && !t.dueDate),
      eliminate: tasks.filter(t => t.priority === 'low')
    };

    res.json({ success: true, data: matrix });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Gantt chart timeline tasks
// @route   GET /api/tasks/gantt
// @access  Private
const getGanttData = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId, isDeleted: false })
      .populate('project', 'title color')
      .populate('dependencies', 'title completed');

    const ganttItems = tasks.map(t => ({
      id: t._id,
      title: t.title,
      startDate: t.createdAt,
      dueDate: t.dueDate || new Date(Date.now() + 86400000 * 3),
      status: t.status,
      completed: t.completed,
      priority: t.priority,
      project: t.project ? t.project.title : 'Unassigned',
      dependencies: t.dependencies.map(d => d._id)
    }));

    res.json({ success: true, count: ganttItems.length, data: ganttItems });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Workload capacity allocation stats
// @route   GET /api/tasks/workload
// @access  Private
const getWorkloadStats = async (req, res) => {
  try {
    const userTasks = await Task.find({ user: req.userId, isDeleted: false });
    const totalEst = userTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const totalAct = userTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
    const capacityHours = 40; // Default weekly capacity

    res.json({
      success: true,
      data: {
        capacityHours,
        totalEstimatedHours: totalEst,
        totalActualHours: totalAct,
        bandwidthUtilization: Math.round((totalEst / capacityHours) * 100),
        status: totalEst > capacityHours ? 'OVERALLOCATED' : 'BALANCED'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Export full user backup
// @route   GET /api/tasks/backup
// @access  Private
const backupDatabase = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId });
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      user: req.userId,
      taskCount: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Restore database snapshot
// @route   POST /api/tasks/restore
// @access  Private
const restoreDatabase = async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ success: false, error: 'Backup data array is required' });
    }

    await Task.deleteMany({ user: req.userId });
    const restored = await Task.insertMany(data.map(t => ({ ...t, user: req.userId, _id: undefined })));

    res.json({
      success: true,
      message: `Successfully restored ${restored.length} tasks`,
      count: restored.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  softDeleteTask,
  restoreTask,
  addComment,
  togglePinTask,
  shareTask,
  getTaskActivity,
  importTasks,
  getTaskStats,
  bulkCompleteTasks,
  bulkDeleteTasks,
  addSubtask,
  toggleSubtask,
  startTimeTracker,
  stopTimeTracker,
  getEisenhowerMatrix,
  getGanttData,
  getWorkloadStats,
  backupDatabase,
  restoreDatabase
};
