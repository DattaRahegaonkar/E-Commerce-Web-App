# Product Management App

A full-stack web application featuring secure user authentication and collaborative product management. Built with modern technologies, this app allows authenticated users to manage products with full CRUD operations in a responsive, user-friendly interface.

## Tech Stack

### Frontend
- **React 19** - Modern UI library with latest features
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

## Local Development Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Quick Start

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd Signup-Login-App-Changes
```

### 2. Environment Configuration

#### Backend (.env)
```
cp .env.example .env
```
OR
```env
MONGO_URI=mongodb://localhost:27017/userdb
JWT_SECRET=your-secure-jwt-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
PORT=3000
```

#### Frontend (.env)
```
cp .env.example .env
```
OR
```env
VITE_API_URL=http://localhost:3000
```


#### 3. Backend Setup
```
cd Backend
npm install
npm start
```

#### 4. Frontend Setup
```
cd Frontend
npm install
npm run dev
```


## Demo Data

Populate your database with sample data for testing:

```bash
cd Backend
npm run demo-data
```

**Sample Login Credentials:**0
- `john@example.com` / `password123`
- `jane@example.com` / `password123`
- `alice@example.com` / `password123`

## API Endpoints

### Authentication
- `POST /signup` - Register new user
- `POST /login` - User authentication
- `POST /logout` - User logout

### Products
- `GET /show` - Get all products
- `GET /product/:id` - Get specific product
- `POST /add` - Create product (protected)
- `PATCH /update/:id` - Update product (protected)
- `DELETE /delete/:id` - Delete product (protected)
- `GET /search/:key` - Search products

## Project Structure

```
├── Backend/
│   ├── db/              # Database models
│   ├── middleware/      # Auth & validation
│   ├── index.js         # Main server file
│   └── demo-data.js     # Sample data script
├── Frontend/
│   ├── src/
│   │   ├── Components/  # React components
│   │   └── App.jsx      # Main app component
│   └── public/
├── kubernetes/          # K8s deployment files
└── docker-compose.yml   # Docker configuration
```

