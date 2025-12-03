const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store
let tasks = [
  { id: 1, title: 'Learn API Testing', description: 'Master Bruno and Postman', completed: false, priority: 'high', createdAt: new Date().toISOString() },
  { id: 2, title: 'Build Demo API', description: 'Create a testable REST API', completed: true, priority: 'medium', createdAt: new Date().toISOString() },
  { id: 3, title: 'Write Documentation', description: 'Document all endpoints', completed: false, priority: 'low', createdAt: new Date().toISOString() }
];

let nextId = 4;

// Simple auth middleware (for demo purposes)
const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === 'demo-key-12345') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or missing API key. Use x-api-key: demo-key-12345' });
  }
};

// ============================================
// PUBLIC ENDPOINTS (no auth required)
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// API Info / Welcome
app.get('/api', (req, res) => {
  res.json({
    name: 'Demo Task Manager API',
    version: '1.0.0',
    description: 'A demo REST API for testing with Bruno or Postman',
    endpoints: {
      public: [
        'GET /api - This info',
        'GET /api/health - Health check',
        'GET /api/echo?message=hello - Echo service'
      ],
      tasks: [
        'GET /api/tasks - List all tasks (supports ?completed=true/false&priority=high/medium/low)',
        'GET /api/tasks/:id - Get single task',
        'POST /api/tasks - Create task',
        'PUT /api/tasks/:id - Update task',
        'PATCH /api/tasks/:id/toggle - Toggle completion',
        'DELETE /api/tasks/:id - Delete task'
      ],
      protected: [
        'GET /api/protected/stats - Task statistics (requires x-api-key header)'
      ]
    },
    authentication: {
      type: 'API Key',
      header: 'x-api-key',
      demoKey: 'demo-key-12345'
    }
  });
});

// Echo endpoint (great for testing query params)
app.get('/api/echo', (req, res) => {
  res.json({
    message: req.query.message || 'No message provided',
    queryParams: req.query,
    headers: {
      userAgent: req.headers['user-agent'],
      contentType: req.headers['content-type'],
      customHeaders: Object.keys(req.headers).filter(h => h.startsWith('x-'))
    },
    timestamp: new Date().toISOString()
  });
});

// POST echo (great for testing request bodies)
app.post('/api/echo', (req, res) => {
  res.json({
    received: req.body,
    contentType: req.headers['content-type'],
    timestamp: new Date().toISOString()
  });
});

// ============================================
// TASK ENDPOINTS
// ============================================

// GET all tasks (with filtering)
app.get('/api/tasks', (req, res) => {
  let result = [...tasks];
  
  // Filter by completion status
  if (req.query.completed !== undefined) {
    const isCompleted = req.query.completed === 'true';
    result = result.filter(t => t.completed === isCompleted);
  }
  
  // Filter by priority
  if (req.query.priority) {
    result = result.filter(t => t.priority === req.query.priority);
  }
  
  // Search by title
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    result = result.filter(t => t.title.toLowerCase().includes(search));
  }

  res.json({
    count: result.length,
    tasks: result
  });
});

// GET single task
app.get('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  
  if (!task) {
    return res.status(404).json({ error: 'Not Found', message: `Task with id ${id} not found` });
  }
  
  res.json(task);
});

// POST create task
app.post('/api/tasks', (req, res) => {
  const { title, description, priority } = req.body;
  
  // Validation
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Bad Request', message: 'Title is required' });
  }
  
  const validPriorities = ['low', 'medium', 'high'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ 
      error: 'Bad Request', 
      message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` 
    });
  }
  
  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: description || '',
    completed: false,
    priority: priority || 'medium',
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT update task (full update)
app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Not Found', message: `Task with id ${id} not found` });
  }
  
  const { title, description, completed, priority } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Bad Request', message: 'Title is required' });
  }
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: title.trim(),
    description: description || '',
    completed: Boolean(completed),
    priority: priority || 'medium',
    updatedAt: new Date().toISOString()
  };
  
  res.json(tasks[taskIndex]);
});

// PATCH toggle completion
app.patch('/api/tasks/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  
  if (!task) {
    return res.status(404).json({ error: 'Not Found', message: `Task with id ${id} not found` });
  }
  
  task.completed = !task.completed;
  task.updatedAt = new Date().toISOString();
  
  res.json(task);
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Not Found', message: `Task with id ${id} not found` });
  }
  
  const deleted = tasks.splice(taskIndex, 1)[0];
  res.json({ message: 'Task deleted successfully', deleted });
});

// ============================================
// PROTECTED ENDPOINTS (require auth)
// ============================================

app.get('/api/protected/stats', authMiddleware, (req, res) => {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    byPriority: {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    },
    completionRate: tasks.length > 0 
      ? ((tasks.filter(t => t.completed).length / tasks.length) * 100).toFixed(1) + '%'
      : '0%'
  };
  
  res.json(stats);
});

// POST endpoint for testing different response codes
app.post('/api/test/response/:code', (req, res) => {
  const code = parseInt(req.params.code);
  const validCodes = [200, 201, 400, 401, 403, 404, 500];
  
  if (!validCodes.includes(code)) {
    return res.status(400).json({ 
      error: 'Invalid code', 
      message: `Supported codes: ${validCodes.join(', ')}` 
    });
  }
  
  const responses = {
    200: { status: 'OK', message: 'Request successful' },
    201: { status: 'Created', message: 'Resource created' },
    400: { error: 'Bad Request', message: 'Invalid request data' },
    401: { error: 'Unauthorized', message: 'Authentication required' },
    403: { error: 'Forbidden', message: 'Access denied' },
    404: { error: 'Not Found', message: 'Resource not found' },
    500: { error: 'Internal Server Error', message: 'Something went wrong' }
  };
  
  res.status(code).json(responses[code]);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: `Route ${req.method} ${req.path} not found`,
    hint: 'Visit GET /api for available endpoints'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   Demo Task Manager API                    ║
╠═══════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}                 ║
║  API Info:          http://localhost:${PORT}/api             ║
║  Health Check:      http://localhost:${PORT}/api/health      ║
╠═══════════════════════════════════════════════════════════╣
║  Test with Bruno or Postman!                              ║
║  Protected routes use header: x-api-key: demo-key-12345   ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
