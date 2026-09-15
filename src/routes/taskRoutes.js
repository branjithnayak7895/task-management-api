const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// Protect all task routes
router.use(protect);

// Specialized endpoints
router.get('/stats', getTaskStats);
router.get('/eisenhower', getEisenhowerMatrix);
router.get('/gantt', getGanttData);
router.get('/workload', getWorkloadStats);
router.get('/backup', backupDatabase);
router.post('/restore', restoreDatabase);
router.patch('/bulk-complete', bulkCompleteTasks);
router.delete('/bulk-delete', bulkDeleteTasks);
router.post('/import', importTasks);

// Individual task specialized endpoints
router.post('/:id/time/start', startTimeTracker);
router.post('/:id/time/stop', stopTimeTracker);
router.patch('/:id/pin', togglePinTask);
router.post('/:id/share', shareTask);
router.get('/:id/activity', getTaskActivity);
router.delete('/:id/soft', softDeleteTask);
router.post('/:id/restore', restoreTask);
router.post('/:id/comments', addComment);

// Subtask endpoints
router.post('/:id/subtasks', addSubtask);
router.patch('/:id/subtasks/:subtaskId', toggleSubtask);

// Standard CRUD endpoints
router
  .route('/')
  .get(getTasks)
  .post(createTask);

router
  .route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
