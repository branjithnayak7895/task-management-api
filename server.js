const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');
const userRoutes = require('./src/routes/userRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const sprintRoutes = require('./src/routes/sprintRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const templateRoutes = require('./src/routes/templateRoutes');
const webhookRoutes = require('./src/routes/webhookRoutes');
const auditRoutes = require('./src/routes/auditRoutes');
const systemRoutes = require('./src/routes/systemRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/system', systemRoutes);

// Direct docs endpoint alias
app.get('/api/docs', (req, res) => res.redirect('/api/system/docs'));
app.get('/docs', (req, res) => res.redirect('/api/system/docs'));

// Root endpoint for API documentation status
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Task Management API',
    status: 'Active',
    version: '1.0.0',
    documentation: {
      userEndpoints: {
        register: 'POST /api/users/register',
        login: 'POST /api/users/login',
        profile: 'GET /api/users/profile (Protected)'
      },
      taskEndpoints: {
        getTasks: 'GET /api/tasks (Protected, query: page, limit, completed, priority, category)',
        createTask: 'POST /api/tasks (Protected)',
        getTaskById: 'GET /api/tasks/:id (Protected)',
        updateTask: 'PUT /api/tasks/:id (Protected)',
        deleteTask: 'DELETE /api/tasks/:id (Protected)'
      }
    }
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Resource not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Start server if not running in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Task Management API server running on port ${PORT}`);
    console.log(`🌐 Interactive Dashboard: http://localhost:${PORT}`);
    console.log(`=======================================================`);
    
    // Connect to database in background
    connectDB().catch((err) => {
      console.log(`💡 Note: Provide your MongoDB Atlas URI in .env (MONGODB_URI) to connect to a cloud database.`);
    });
  });
}

module.exports = app;

