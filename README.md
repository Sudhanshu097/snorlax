# Secure Authentication Service

A production-ready authentication and authorization service built with NestJS, featuring JWT-based authentication, role-based access control, and comprehensive security measures. This service provides a robust foundation for user management and secure API access.

## 🚀 Key Features

- **Authentication**
  - JWT-based authentication with refresh tokens
  - Email verification system
  - Secure password hashing with bcrypt
  - Rate limiting and brute force protection

- **Authorization**
  - Role-based access control (RBAC)
  - Permission-based guards
  - Protected route handling

- **Security**
  - Password reset functionality
  - Account lockout system
  - CORS protection
  - XSS prevention
  - Request validation and sanitization

- **Modern Architecture**
  - Redis caching
  - Prometheus metrics
  - Docker support
  - Comprehensive logging
  - Swagger API documentation

## 📋 Prerequisites

- Node.js 18 or higher
- Redis 6 or higher
- PostgreSQL 14 or higher
- Docker (optional)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd secure-auth-service
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:
```bash
npm run migrate
```

## 🚀 Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker-compose up -d
```

## 🔧 Configuration

Key environment variables:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGINS=http://localhost:3000
REDIS_HOST=localhost
REDIS_PORT=6379
```

See `.env.example` for all available options.

## 📚 API Documentation

### Authentication Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/verify-email` - Email verification
- `POST /auth/refresh` - Refresh access token

### Example Usage

```typescript
// Registration
const response = await fetch('/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123',
    firstName: 'John',
    lastName: 'Doe'
  })
});
```

## 🔍 Troubleshooting

Common issues and solutions:

1. **Connection Errors**
   - Verify Redis and PostgreSQL are running
   - Check environment variables
   - Ensure correct ports are available

2. **Authentication Issues**
   - Verify email configuration
   - Check JWT secret configuration
   - Ensure correct token usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Create an issue for bug reports or feature requests
- Join our [Discord community](https://discord.gg/example)
- Email support: support@example.com

## 📊 Metrics and Monitoring

Access metrics at `/metrics` endpoint for Prometheus integration.

Key metrics available:
- HTTP request duration
- Error rates
- Authentication attempts
- Rate limit violations

## 🔐 Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens expire after 15 minutes
- Rate limiting prevents brute force attacks
- Input validation prevents injection attacks
- CORS and Helmet protect against common web vulnerabilities