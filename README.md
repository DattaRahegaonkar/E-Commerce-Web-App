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
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80,http://localhost
PORT=8081
```

#### Frontend (.env)
```
cp .env.example .env
```
OR
```env
VITE_API_URL=http://localhost:80
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
docker run -d \
  --name mongodb \
  --restart unless-stopped \
  --network ecommerce-network \
  -v ecommerce-volume:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=root123 \
  -e MONGO_INITDB_DATABASE=ecommerceDB \
  mongo:latest
```

#### Create Application User (Security Best Practice)
```bash
# Connect to MongoDB as root
docker exec -it mongodb mongosh -u root -p root123 --authenticationDatabase admin

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

#### Build Backend Image
```bash
cd Backend
docker build --no-cache -t ecommerce-backend .
```

#### Run Backend Container
```bash
docker run -d \
  --name backend \
  --restart unless-stopped \
  --network ecommerce-network \
  --env-file .env \
  ecommerce-backend:latest
```

#### Monitor Backend Logs
```bash
docker logs backend
docker logs -f backend  # Follow logs in real-time
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

    add_header Content-Security-Policy "default-src 'self'; font-src 'self' https://fonts.gstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; connect-src 'self' http://72.60.111.1;" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Content-Security-Policy "default-src 'self'; font-src 'self' https://fonts.gstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; connect-src 'self' http://72.60.111.1;" always;
    }

    gzip on;
    gzip_types text/plain application/xml application/json text/css application/javascript image/svg+xml;
}

```

#### Build Frontend Image
```bash
cd Frontend
docker build --no-cache -t ecommerce-frontend .
```

#### Run Frontend Container
```bash
docker run -d \
  --name frontend \
  --restart unless-stopped \
  --network ecommerce-network \
  --env-file .env \
  ecommerce-frontend:latest
```

#### Monitor Frontend Logs
```bash
docker logs frontend
docker logs -f frontend  # Follow logs in real-time
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
    server frontend:80;
}

upstream backend {
    server backend:8081;
}

server {
    listen 80;
    server_name _;
    
    # All API routes go to backend
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header Origin http://72.60.111.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
docker run -d \
  --name nginx \
  --network ecommerce-network \
  -p 80:80 \
  -v $(pwd)/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:alpine
```

#### Access Application
- **Frontend**: http://localhost
- **API**: http://localhost/show, http://localhost/login, etc.
- **All routes**: Automatically proxied to correct container


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


## Docker Compose Deployment

### Prerequisites
```bash
# Create Docker network and volume
docker network create ecommerce-network
docker volume create ecommerce-volume
```

### Quick Deployment
```bash
# Clone and navigate to project
git clone <repository-url>
cd E-Commerce-Web-App

# Deploy with Docker Compose
docker compose up -d
```

### Configuration Files Required
- `Backend/.env` - Backend environment variables
- `Frontend/.env` - Frontend environment variables  
- `nginx/nginx.conf` - Nginx reverse proxy configuration


### Access Application
- **Frontend**: http://localhost
- **API Health**: http://localhost/api/health

### Management Commands
```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild and restart
docker compose up -d --build
```
