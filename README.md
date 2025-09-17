# Appointment Service API

A RESTful API for managing appointment services with user authentication and authorization.

Written by Harry Hung, with the help of Claude Code.

## Features

### User Management
- **User Registration** - Create new user accounts with email and password
- **User Login** - Authenticate users and receive JWT tokens
- **Password Security** - Passwords are hashed using bcrypt with 12 salt rounds
- **JWT Authentication** - Secure token-based authentication

### Service Management
- **Public Service Listing** - View all public, non-deleted services
- **Service Details** - Get detailed information about individual services
- **Service Creation** - Create new services (requires authentication)
- **Service Updates** - Update existing services (requires authentication)
- **Service Deletion** - Soft delete services (requires authentication)

### API Features
- **RESTful Design** - Clean, predictable API endpoints
- **Input Validation** - Request validation using Joi schemas
- **Error Handling** - Comprehensive error responses
- **Soft Deletion** - Services are soft-deleted, not permanently removed
- **Public/Private Services** - Control service visibility

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Koa.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Joi
- **Testing**: Jest with Supertest
- **Package Manager**: pnpm

## Prerequisites

- Node.js (tested under v22, v18 or higher recommended)
- PostgreSQL database
- pnpm or your favorite package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wishmobile-interview
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/your_database
   TEST_DATABASE_URL=postgresql://username:password@localhost:5432/your_test_database
   JWT_SECRET=your-super-secret-jwt-key
   PORT=8888
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Run migrations to create tables
   npx sequelize-cli db:migrate
   ```

## Running the Application

### Development Mode
```bash
pnpm dev
```
The server will start on `http://localhost:8888` (or your configured PORT).

### Production Mode
```bash
pnpm prod
```

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Linting
```bash
pnpm lint
```

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /user/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (400):**
```json
{
  "error": "User with this email already exists"
}
```

#### Login User
```http
POST /user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

### Service Endpoints

#### List Public Services
```http
GET /service/all
```

**Success Response (200):**
```json
{
  "services": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Hair Cut",
      "description": "Professional hair cutting service",
      "price": 500,
      "showTime": 45,
      "order": 1,
      "isPublic": true,
      "creationDate": "2024-01-15T10:30:00.000Z",
      "updatedOn": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "789e0123-e89b-12d3-a456-426614174002",
      "name": "Massage Therapy",
      "description": "Relaxing full body massage",
      "price": 1200,
      "showTime": 90,
      "order": 2,
      "isPublic": true,
      "creationDate": "2024-01-16T14:20:00.000Z",
      "updatedOn": "2024-01-16T14:20:00.000Z"
    }
  ]
}
```

#### Get Service by ID
```http
GET /service/{serviceId}
```

**Success Response (200):**
```json
{
  "service": {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "Hair Cut",
    "description": "Professional hair cutting service",
    "price": 500,
    "showTime": 45,
    "order": 1,
    "isPublic": true,
    "creationDate": "2024-01-15T10:30:00.000Z",
    "updatedOn": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Service not found"
}
```

#### Create Service (Authenticated)
```http
POST /service
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "Service Name",
  "description": "Service description",
  "price": 100,
  "showTime": 30,
  "order": 1,
  "isPublic": true
}
```

**Success Response (201):**
```json
{
  "message": "Service created successfully",
  "service": {
    "id": "abc12345-e89b-12d3-a456-426614174003",
    "name": "Service Name",
    "description": "Service description",
    "price": 100,
    "showTime": 30,
    "order": 1,
    "isPublic": true,
    "isRemove": false,
    "creationDate": "2024-01-17T09:15:00.000Z",
    "updatedOn": "2024-01-17T09:15:00.000Z"
  }
}
```

**Error Response (400) - Validation Error:**
```json
{
  "error": "Validation failed"
}
```

**Error Response (401) - No Token:**
```json
{
  "error": "Access token required"
}
```

#### Update Service (Authenticated)
```http
PUT /service/{serviceId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "Updated Service Name",
  "price": 150
}
```

**Success Response (200):**
```json
{
  "message": "Service updated successfully",
  "service": {
    "id": "abc12345-e89b-12d3-a456-426614174003",
    "name": "Updated Service Name",
    "description": "Service description",
    "price": 150,
    "showTime": 30,
    "order": 1,
    "isPublic": true,
    "isRemove": false,
    "creationDate": "2024-01-17T09:15:00.000Z",
    "updatedOn": "2024-01-17T10:45:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Service not found"
}
```

#### Delete Service (Authenticated)
```http
DELETE /service/{serviceId}
Authorization: Bearer {jwt_token}
```

**Success Response (200):**
```json
{
  "message": "Service deleted successfully"
}
```

**Error Response (404):**
```json
{
  "error": "Service not found"
}
```

**Error Response (401) - No Token:**
```json
{
  "error": "Access token required"
}
```

**Error Response (403) - Invalid Token:**
```json
{
  "error": "Invalid or expired token"
}
```

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `name` (String)
- `createdAt` (Date)
- `updatedAt` (Date)

### AppointmentServices Table
- `id` (UUID, Primary Key)
- `name` (String) - 服務名稱
- `description` (Text) - 服務描述
- `price` (Integer) - 實際價格
- `showTime` (Integer) - 顯示時間
- `order` (Integer) - 排序
- `isRemove` (Boolean) - 是否已軟刪除
- `isPublic` (Boolean) - 是否公開於 Client
- `createdAt` (Date)
- `updatedAt` (Date)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login or registration, you'll receive a token that must be included in the Authorization header for protected endpoints:

```http
Authorization: Bearer <your_jwt_token>
```

Tokens expire after 24 hours by default.

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (invalid/expired token)
- `404` - Not Found
- `500` - Internal Server Error

Example error response:
```json
{
  "error": "User with this email already exists"
}
```

## Testing

The project includes comprehensive test coverage:

- **User Controller Tests** - Registration, login, validation
- **Service Controller Tests** - CRUD operations, authentication
- **Authentication Middleware Tests** - JWT validation, error cases

Test files are located in the `tests/` directory and follow the same structure as the source code.

## Development

### Project Structure
```
src/
├── controllers/     # Request handlers
├── middleware/      # Custom middleware (auth)
├── models/         # Database models
├── utils/          # Utility functions
├── db.ts          # Database connection
├── env.ts         # Environment configuration
├── router.ts      # Route definitions
└── server.ts      # Koa server setup

tests/
├── controllers/   # Controller tests
└── middleware/    # Middleware tests

migrations/        # Database migrations
```

### Database Migrations
Uses Sequelize CLI under the hood.

To create a new migration:
```bash
npx sequelize-cli migration:generate --name migration-name
```

To run migrations:
```bash
npx sequelize-cli db:migrate # or
pnpm db:migrate
```

To rollback migrations:
```bash
npx sequelize-cli db:migrate:undo # or
pnpm db:migrate:undo
```
