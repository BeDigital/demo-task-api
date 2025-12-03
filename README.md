# Demo Task Manager API

A simple REST API perfect for learning and testing with **Bruno** or **Postman**.

## 🌐 Live Endpoints

| Environment | Base URL |
|-------------|----------|
| **DEV** | http://k8s-apiappde-apidemoa-7fa86a2d5d-1318204711.us-east-2.elb.amazonaws.com |
| **PROD** | http://k8s-apiapppr-apidemoa-a29a4cdfa6-169694946.us-east-2.elb.amazonaws.com |

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or with auto-reload during development
npm run dev
```

Server runs at: `http://localhost:3001`

## Import Collections

### Bruno
1. Open Bruno
2. Click "Open Collection"
3. Select the `bruno-collection` folder

### Postman
1. Open Postman
2. Click "Import"
3. Select `postman-collection.json`

## API Endpoints

### Public (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api` | API info and endpoint list |
| GET | `/api/health` | Health check with uptime |
| GET | `/api/echo` | Echo query params & headers |
| POST | `/api/echo` | Echo request body |

### Tasks CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task (full) |
| PATCH | `/api/tasks/:id/toggle` | Toggle completion |
| DELETE | `/api/tasks/:id` | Delete task |

**Query Filters for GET /api/tasks:**
- `?completed=true` or `?completed=false`
- `?priority=high` or `medium` or `low`
- `?search=keyword`

### Protected (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/protected/stats` | Task statistics |

**Authentication:** Add header `x-api-key: demo-key-12345`

### Test Utilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/test/response/:code` | Returns specified HTTP code (200, 201, 400, 401, 403, 404, 500) |

## Example Requests

### Create a Task
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "My Task", "description": "Testing", "priority": "high"}'
```

### Get Protected Stats
```bash
curl http://localhost:3001/api/protected/stats \
  -H "x-api-key: demo-key-12345"
```

### Filter Tasks
```bash
curl "http://localhost:3001/api/tasks?completed=false&priority=high"
```

## What to Test

Great scenarios for API testing practice:

1. **Happy Path** - Create, read, update, delete tasks
2. **Validation** - POST without required fields (400 error)
3. **Not Found** - GET /api/tasks/999 (404 error)  
4. **Auth** - Access protected endpoint without key (401)
5. **Filters** - Combine query parameters
6. **Response Codes** - Use /api/test/response/:code

---
Built for demo & learning purposes 🚀
