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
  --network ecommerce-network \
  -p 8081:8081 \
  --env-file .env \
  ecommerce-backend:latest
```

#### Monitor Backend Logs
```bash
docker logs backend
docker logs -f backend  # Follow logs in real-time
```


### 3. Frontend Container Setup

#### Build Frontend Image
```bash
cd Frontend
docker build --no-cache -t ecommerce-frontend .
```

#### Run Frontend Container
```bash
docker run -d \
  --name frontend \
  --network ecommerce-network \
  -p 3000:80 \
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

#### Test API Endpoints
```bash
# Health check
curl http://localhost:8081/show
```

### 5. Container Management

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

