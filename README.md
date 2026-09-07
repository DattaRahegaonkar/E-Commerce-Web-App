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
cd E-Commerce-Web-App
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
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80,http://localhost
PORT=8081
```

#### Frontend (.env)
```
cp .env.example .env
```
OR
```env
VITE_API_URL=http://localhost:8081
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

## Application On 
```bash
http://localhost:5173
```
