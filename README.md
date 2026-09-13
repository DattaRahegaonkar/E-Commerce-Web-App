# Product Management App

A full-stack web application featuring secure user authentication and collaborative product management. Built with modern technologies, this app allows authenticated users to manage products with full CRUD operations in a responsive, user-friendly interface.


Note : This app state is at the local state, if you have to try with docker, kubernetes then you have to make changes according to mentioned in the readme.md file

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

## Docker Deployment

### Prerequisites
```bash
# Create Docker network and volume
docker network create ecommerce-network
docker volume create ecommerce-volume
```

### 1. MongoDB Container Setup

#### Start MongoDB Container
```bash
docker compose up -d mongodb
```

#### Create Application User (Security Best Practice)
```bash
# Connect to MongoDB as root
docker exec -it mongodb-container mongosh -u root -p root@123 --authenticationDatabase admin

# Switch to application database
use ecommerceDB

# Create dedicated user with limited privileges
db.createUser({
  user: "ecommerceuser",
  pwd: "ecommerce123",
  roles: [{ role: "readWrite", db: "ecommerceDB" }]
})

# Verify user creation
show users

# Exit MongoDB shell
exit
```

### 2. Backend Container Setup

#### change the `.env` file
```bash
MONGO_URI=mongodb://ecommerceuser:ecommerce123@mongodb:27017/ecommerceDB
JWT_SECRET=your-secure-jwt-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80,http://<frontend-comntainer-name>,http://<frontend-comntainer-name>:80,http://<ec2-public-ip>
PORT=8081
```

#### Run Backend Container
```bash
docker compose up -d backend
```

#### Monitor Backend Logs
```bash
docker logs backend-container
docker logs -f backend-container  # Follow logs in real-time
```


### 3. Frontend Container Setup

#### Nginx Configuration for React App
Create `Frontend/nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
}

```

#### Run Frontend Container

```bash
docker compose up -d frontend
```

#### Monitor Frontend Logs
```bash
docker logs frontend-container
docker logs -f frontend-container  # Follow logs in real-time
```

### 4. Verification

#### Check Database Data
```bash
# Connect to MongoDB with application user
docker exec -it mongodb mongosh -u ecommerceuser -p ecommerce123 --authenticationDatabase ecommerceDB

# View collections and data
show collections
db.users.find().pretty()
db.products.find().pretty()
```

### 5. Nginx Reverse Proxy Setup

#### Create Nginx Configuration
```bash
# Create nginx directory
mkdir -p nginx
```

Create `nginx/nginx.conf`:
```nginx
upstream frontend {
    server frontend-container:80;
}

upstream backend {
    server backend-container:8081;
}

server {
    listen 80;
    server_name _;
    
    # All API routes go to backend
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Don't override Origin header - let it pass through for proper CORS handling
    }
    
    # Everything else goes to frontend (React SPA)
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

```

#### Run Nginx Reverse Proxy
```bash
docker compose up -d nginx
```

#### Access Application
```bash
http://<ec2-public-ip>:<port>
```


### 6. Container Management

#### Stop Containers
```bash
docker stop frontend backend mongodb
```

#### Remove Containers
```bash
docker rm frontend backend mongodb
```

#### Clean Up Resources
```bash
docker network rm ecommerce-network
docker volume rm ecommerce-volume
docker rmi ecommerce-frontend ecommerce-backend
```


### 🐳 Container Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Nginx    │ ◄─── Entry Point (Port 80)
│ Reverse     │
│   Proxy     │
└──────┬──────┘
       │
       ├─── Static Files ───► ┌─────────────┐
       │                      │  Frontend   │
       │                      │ React App   │
       │                      │ (Port 80)   │
       │                      └─────────────┘
       │                            │
       │                            │ API Calls
       │                            ▼
       └─── API Routes ──────► ┌─────────────┐     ┌─────────────┐
                               │   Backend   │────►│  MongoDB    │
                               │ Express API │     │  Database   │
                               │ (Port 8081) │     │(Port 27017) │
                               └─────────────┘     └─────────────┘

```

### Configuration Files Required
- `database/.env` - database environment variables
- `Backend/.env` - Backend environment variables
- `Frontend/.env` - Frontend environment variables
- `Frontend/nginc.conf` - Nginx to serve the static files
- `nginx/nginx.conf` - Nginx reverse proxy configuration

### Management Commands
```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild and restart
docker compose up -d --build
```
