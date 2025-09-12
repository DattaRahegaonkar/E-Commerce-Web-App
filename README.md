# Signup-Login App with Product Management

This is a full-stack web application featuring user authentication and product management. The application consists of a React frontend and an Express.js backend with MongoDB database.

## Key Features

- User registration and authentication
- JWT-based authentication with HTTP-only cookies
- Secure password handling with bcrypt
- Product management (create, read, update, delete)
- Form validation
- Responsive UI with Tailwind CSS and Framer Motion
- Docker and Kubernetes support

## Recent Improvements

### Security Enhancements
- Implemented bcrypt password hashing
- Added JWT-based authentication with HTTP-only cookies
- Created proper authentication middleware
- Added input validation using express-validator

### Code Quality Improvements
- Enhanced error handling throughout the API
- Updated Product model with better validation
- Applied validation to all routes
- Improved CORS configuration for better security
- Added helper scripts for dependency management

### Frontend Enhancements
- Updated components to work with new API responses
- Added proper credentials handling for cookies
- Improved error handling and user feedback

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or remote)
- npm or yarn

### Installation and Setup

#### Backend
1. Navigate to the Backend directory:
   ```
   cd Backend
   ```

2. Install dependencies and start the server:
   ```
   node start.js
   ```
   This script will:
   - Check for missing dependencies and install them
   - Create a basic .env file if one doesn't exist
   - Start the server

3. Alternatively, you can install dependencies manually:
   ```
   npm install
   ```

#### Frontend
1. Navigate to the Frontend directory:
   ```
   cd Frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/userdb
JWT_SECRET=your-secret-key
NODE_ENV=development
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

## Docker Deployment

The project includes Docker configuration for easy deployment:

```
docker-compose up
```

This will start:
- MongoDB database
- Backend API server
- Frontend web server

## API Endpoints

### Authentication
- `POST /signup` - Register a new user
- `POST /login` - Authenticate a user
- `POST /logout` - Log out a user

### Products
- `GET /show` - Get all products
- `GET /product/:id` - Get a specific product
- `POST /add` - Add a new product (protected)
- `PATCH /update/:id` - Update a product (protected)
- `DELETE /delete/:id` - Delete a product (protected)
- `GET /search/:key` - Search products

## Troubleshooting

### Common Issues

1. **500 Internal Server Error on Signup/Login**
   - Ensure bcrypt is properly installed: `npm uninstall bcrypt && npm install bcrypt`
   - Check MongoDB connection string in .env file
   - Make sure JWT_SECRET is set in .env file

2. **Authentication Issues**
   - Cookies not working: Check CORS configuration and ensure credentials: 'include' is set in frontend fetch requests
   - Token issues: Verify JWT_SECRET is consistent

3. **Database Connection Problems**
   - Verify MongoDB is running
   - Check MONGO_URI in .env file

## License

This project is licensed under the ISC License.
