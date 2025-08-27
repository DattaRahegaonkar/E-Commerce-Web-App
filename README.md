# Signup-Login App 🛡️

A simple and secure full-stack **Signup and Login Application** built using **Node.js**, **MongoDB**, and **React**. Designed with scalability and modern DevOps practices in mind (Docker, Jenkins, Kubernetes, Ingress).

---

## ⚙️ Features

- ✅ User Signup
- ✅ Secure Login with hashed passwords
- ✅ Adding Product, Update and Listing all Products
- ✅ React Frontend with Fetch
- ✅ MongoDB as the database
- ✅ Docker + Kubernetes ready

---

## 🧰 Tech Stack

**Frontend:**
- React
- Fetch
- Material UI (optional)

**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose
- Authentication using **cookies** (for storing tokens securely) and **localStorage** (for client-side state persistence)

**DevOps:**
- Docker
- Kubernetes (Kind or Minikube)
- Ingress NGINX

# Docker Deployment

## Getting Started

```
git clone https://github.com/DattaRahegaonkar/Signup-Login-App.git
cd signup-login-app
```

### 2. Setup Environment Variables
Create .env in backend/ with:
```
MONGO_URI=mongodb://mongodb:27017/userdb
```

### 3. Database
Build & Run Mongodb
```
docker run -d -p 27017:27017 -v <Name of the volume>:<Mounting point of created volume> --network signup-login-app --name mongodb  mongo:latest
```

### 3. Backend
Build backend
```
docker build -t signup-login-backend .
```

Run backend
```
docker run -d -p 3000:3000 -e MONGO_URI=mongodb://mongodb:27017/userdb --network signup-login-app --name signup-login--app-backend signup-login-backend:latest
```

### 3. Frontend
Build Frontend
```
docker build -t signup-login-frontend .
```

Run frontend
```
docker run -d -p 5000:5000 --network signup-login-app --name signup-login--app-frontend signup-login-frontend:latest
```

# Kubernetes Deployment
In The `Kubernetes` directory holds Kubernetes manifests for deploying your application on Kubernetes Kind cluster using ingress. Understand and customize these files to suit your project needs.

- `mongo-deployment.yaml & mongo-service.yml` – Deploys MongoDB and its service.
- `backend-deployment.yaml & backend-service.yml` – Deploys the Node.js Express API and its service.
- `frontend-deployment.yaml & frontend-service.yml` – Deploys the React application.
- `ingress.yaml` – Sets up routing rules to access the app via browser.

apply the manifest files
```
kubectl apply -f namespace.yml
kubectl apply -f mongo-pv.yml
kubectl apply -f mongo-pvc.yml
kubectl apply -f mongo-deployment.yaml
kubectl apply -f mongo-service.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
kubectl apply -f ingress.yaml
```

Expose the Ingress
```
kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8080:80 --address=0.0.0.0
```

Open Your Browser on 
```
http://localhost:8080
```
