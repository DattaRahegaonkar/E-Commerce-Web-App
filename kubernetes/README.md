# Kubernetes Deployment Guide

This comprehensive guide provides instructions for deploying the E-Commerce Web App to a Kubernetes cluster. The application consists of a React frontend, Node.js/Express backend, and MongoDB database.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   MongoDB       │
│   (React SPA)   │◄──►│   (Node.js API) │◄──►│   (Database)    │
│   Port: 80      │    │   Port: 8081    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                        ┌─────────────────┐
                        │    Ingress      │
                        │    (Nginx)      │
                        │    Port: 80     │
                        └─────────────────┘
```

## 📋 Prerequisites

- [Kind](https://kind.sigs.k8s.io/) or Kubernetes cluster
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Docker](https://www.docker.com/)
- Built Docker images:
  - `docker_hub_username/ecommerce-backend:latest`
  - `docker_hub_username/ecommerce-frontend:latest`

## 🚀 Quick Start

### 1. Cluster Setup
```bash
# Create Kind cluster
kind create cluster --config ../../config.yml --name ecommerce-cluster

# Verify cluster
kubectl cluster-info --context kind-ecommerce-cluster
```

### 2. Environment Configuration
Update the following files with your environment variables:
- `backend-secret.yml` - Backend configuration
- `frontend-secret.yml` - Frontend API URL
- `mongo-secret.yml` - Database credentials

### 3. Deploy Storage Layer
```bash
# Create namespace
kubectl apply -f namespace.yml

# Deploy persistent storage
kubectl apply -f mongo-pv.yml -f mongo-pvc.yml

# Deploy database
kubectl apply -f mongo-deployment.yml -f mongo-service.yml
```

### 4. Create MongoDB Application User
```bash
# Get MongoDB pod name
kubectl get pod -n ecommerce | grep mongo

# Connect to MongoDB
kubectl exec -it <mongo-pod-name> -n ecommerce -- mongosh -u root -p root123 --authenticationDatabase admin

# Inside MongoDB shell add this user:
use ecommerceDB

db.createUser({
  user: "ecommerceuser",
  pwd: "ecommerce123",
  roles: [{ role: "readWrite", db: "ecommerceDB" }]
})

show users

exit
```

### 5. Deploy Application Layer
```bash
# Deploy backend
kubectl apply -f backend-deployment.yml -f backend-service.yml

# Deploy frontend
kubectl apply -f frontend-deployment.yml -f frontend-service.yml

# Deploy ingress
kubectl apply -f ingress.yml
```

### 6. Verify Deployment
```bash
# Check all resources
kubectl get all -n ecommerce

# Check pod status
kubectl get pods -n ecommerce
```

## 🌐 Access the Application

### Method 1: Port Forwarding (Recommended for Development)
```bash
# Port forward ingress controller
kubectl port-forward service/ingress-nginx-controller -n ingress-nginx 80:80 --address=0.0.0.0

Access at: http://localhost:80
```

### Method 2: Ingress Domain
If ingress is configured with a domain:
- Frontend: `http://your-domain.com`
- API: `http://your-domain.com/api/`

## ✅ Verification & Health Checks

### Check Deployment Status
```bash
# All resources in namespace
kubectl get all -n ecommerce

# Pod status with details
kubectl get pods -n ecommerce -o wide

```

### Database Connectivity Test
```bash
# Connect to MongoDB
kubectl exec -it <mongo-pod> -n ecommerce -- mongosh -u ecommerceuser -p ecommerce123 --authenticationDatabase ecommerceDB

# Test database operations
use ecommerceDB
db.users.find()
db.products.find()
```

## 🔧 Troubleshooting Guide

### Common Issues

#### Pod Creation Errors
```bash
# Check pod status and events
kubectl describe pod <pod-name> -n ecommerce
```

#### Connectivity Issues
```bash
# Test internal service connectivity
kubectl exec -it <backend-pod> -n ecommerce -- curl http://mongo-service:27017
kubectl exec -it <frontend-pod> -n ecommerce -- curl http://backend-service:8081/api/health
```

### Debug Commands
```bash
# Get detailed pod information
kubectl describe pod <pod-name> -n ecommerce

# Check resource usage
kubectl top pods -n ecommerce
```

### Log Analysis
```bash
# Follow logs in real-time
kubectl logs -n ecommerce -l app=backend -f
kubectl logs -n ecommerce -l app=frontend -f
kubectl logs -n ecommerce -l app=mongo -f

```

## 🧹 Cleanup

### Remove All Resources
```bash
# Delete namespace (removes all resources)
kubectl delete namespace ecommerce

# Delete cluster (if using Kind)
kind delete cluster --name ecommerce-cluster
```

## 📊 Resource Optimization

### Current Resource Limits
- **Backend:** Requests: 5m CPU, 40Mi RAM | Limits: 500m CPU, 400Mi RAM
- **Frontend:** Requests: 5m CPU, 40Mi RAM | Limits: 500m CPU, 400Mi RAM
- **MongoDB:** Requests: 5m CPU, 140Mi RAM | Limits: 500m CPU, 590Mi RAM

### Monitoring Commands
```bash
# Resource usage
kubectl top pods -n ecommerce
kubectl top nodes
```