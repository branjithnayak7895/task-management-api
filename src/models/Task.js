const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Subtask title is required'],
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: {
    type: String,
    default: 'Anonymous'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const attachmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  }
});

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    completed: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'completed'],
      default: 'todo'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    recurrence: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    },
    dueDate: {
      type: Date
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: 0
    },
    actualHours: {
      type: Number,
      default: 0,
      min: 0
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    category: {
      type: String,
      enum: ['work', 'personal', 'shopping', 'health', 'other'],
      default: 'personal'
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
    subtasks: [subtaskSchema],
    comments: [commentSchema],
    attachments: [attachmentSchema],
    activityLog: [activitySchema],
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    sprint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sprint'
    },
    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      }
    ],
    timeLogs: [
      {
        startTime: { type: Date },
        endTime: { type: Date },
        durationSeconds: { type: Number, default: 0 }
      }
    ],
    customFields: [
      {
        key: { type: String, trim: true },
        value: { type: String, trim: true }
      }
    ],
    eisenhowerQuadrant: {
      type: String,
      enum: ['do', 'schedule', 'delegate', 'eliminate'],
      default: 'do'
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for query performance
taskSchema.index({ user: 1, isDeleted: 1, isPinned: -1 });
taskSchema.index({ sharedWith: 1 });
taskSchema.index({ user: 1, tags: 1 });
taskSchema.index({ dueDate: 1 });

// Pre-save hook to capitalize the first letter of task title & sync status
taskSchema.pre('save', function (next) {
  if (this.title && typeof this.title === 'string' && this.title.length > 0) {
    this.title = this.title.charAt(0).toUpperCase() + this.title.slice(1);
  }

  if (this.isModified('completed')) {
    this.status = this.completed ? 'completed' : 'todo';
  } else if (this.isModified('status')) {
    this.completed = this.status === 'completed';
  }

  if (this.isNew && this.activityLog.length === 0) {
    this.activityLog.push({ action: 'Task created' });
  }

  next();
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
