# Kubernetes Deployment Flow

End-to-end steps to deploy the e-commerce app on EKS with secrets pulled from AWS Secrets Manager and EBS volume created using AWS EBS CSI driver addon.

---

## Prerequisites

- AWS CLI configured (`aws configure`)
- `eksctl` installed
- `kubectl` installed
- Docker images pushed to Docker Hub:
  - `dattarahegaonkar09/ecommerce-app-backend:v1`
  - `dattarahegaonkar09/ecommerce-app-frontend:v1`

---

## Step 1 — Terraform (VPC + IAM Policy)

```bash
cd terraform
terraform init
terraform apply --auto-approve
```

This creates:
- VPC with public/private subnets
- IAM policy `secrets-policy` that allows `GetSecretValue` + `DescribeSecret` on `ecommerce/*` secrets

---

## Step 2 — Create EKS Cluster

```bash
cd kubernetes
eksctl create cluster -f eks-cluster.yml
```

This creates:
- EKS cluster `eks-cluster` in `eu-west-1`
- Managed node group (2x `c7i-flex.large`) in private subnets
- OIDC provider for IRSA
- ServiceAccount `secret-manager-sa` in `ecommerce` namespace with `secrets-policy` attached
- Addons: `eks-pod-identity-agent`, `aws-secrets-store-csi-driver-provider`, `aws-ebs-csi-driver`

Configure kubectl:
```bash
aws eks update-kubeconfig --region eu-west-1 --name eks-cluster
kubectl get nodes  # verify
```

---

## Step 3 — Create Secrets in AWS Secrets Manager

```bash
aws secretsmanager create-secret \
  --name ecommerce/mongodb-secrets \
  --secret-string '{
    "MONGO_INITDB_ROOT_USERNAME": "root",
    "MONGO_INITDB_ROOT_PASSWORD": "root@123",
    "MONGO_INITDB_DATABASE": "ecommerceDB"
  }' \
  --region eu-west-1

aws secretsmanager create-secret \
  --name ecommerce/backend-secrets \
  --secret-string '{
    "MONGO_URI": "mongodb://ecommerceuser:ecommerce123@mongo-service:27017/ecommerceDB",
    "JWT_SECRET": "<your-jwt-secret>",
    "NODE_ENV": "production",
    "PORT": "8081",
    "JWT_EXPIRES_IN": "7d",
    "ALLOWED_ORIGINS": "http://<alb-url>"
  }' \
  --region eu-west-1

aws secretsmanager create-secret \
  --name ecommerce/frontend-secrets \
  --secret-string '{
    "BACKEND_URL": ""
  }' \
  --region eu-west-1
```

---

## Step 4 — Apply RBAC for Secrets Store CSI Driver

Grants the CSI driver permission to create/update K8s Secrets in the cluster.

```bash
kubectl apply -f secret-sync-rbac.yaml
```

---

## Step 5 — Deploy Namespace + SecretProviderClasses

```bash
kubectl apply -f namespace.yml
kubectl apply -f mongodb-secret-provider.yaml
kubectl apply -f backend-secret-provider.yaml
kubectl apply -f frontend-secret-provider.yaml
```

Each `SecretProviderClass` tells the CSI driver which AWS secret to fetch and how to sync it into a K8s Secret.

---

## Step 6 — Deploy MongoDB

```bash
kubectl apply -f mongo-pvc.yml
kubectl apply -f mongo-deployment.yml
kubectl apply -f mongo-service.yml
```

Mounting the CSI volume in the pod triggers the secret sync — this creates the `mongodb-secret` K8s Secret automatically.

Verify:
```bash
kubectl get pods -n ecommerce
kubectl get secret mongodb-secret -n ecommerce  # should exist now
```

---

## Step 7 — Create MongoDB Application User

```bash
# Get mongo pod name
kubectl get pods -n ecommerce -l app=mongo

# Connect as root
kubectl exec -it <mongo-pod-name> -n ecommerce -- mongosh -u root -p root@123 --authenticationDatabase admin
```

Inside the shell:
```js
use ecommerceDB

db.createUser({
  user: "ecommerceuser",
  pwd: "ecommerce123",
  roles: [{ role: "readWrite", db: "ecommerceDB" }]
})

show users
exit
```

---

## Step 8 — Deploy Backend

```bash
kubectl apply -f backend-deployment.yml
kubectl apply -f backend-service.yml
```

Verify:
```bash
kubectl get pods -n ecommerce -l app=backend
kubectl get secret backend-secret -n ecommerce  # should exist now
```

---

## Step 9 — Deploy Frontend

```bash
kubectl apply -f frontend-deployment.yml
kubectl apply -f frontend-service.yml
```

Verify:
```bash
kubectl get pods -n ecommerce -l app=frontend
kubectl get secret frontend-secret -n ecommerce  # should exist now
```

---

## Step 10 — Deploy Ingress

Install the Nginx Ingress Controller:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.15.1/deploy/static/provider/cloud/deploy.yaml
```

Then deploy the ingress rules:
```bash
kubectl apply -f ingress.yml
```

Traffic routing:
- `/api/*` → `backend-service:8081`
- `/*` → `frontend-service:80`

Get the Ingress URL:
```bash
kubectl get ingress -n ecommerce
```

Update `ALLOWED_ORIGINS` in `ecommerce/backend-secrets` and `BACKEND_URL` in `ecommerce/frontend-secrets` with the actual URL, then restart the pods:
```bash
kubectl rollout restart deployment/backend-deployment -n ecommerce
kubectl rollout restart deployment/frontend-deployment -n ecommerce
```

---

## Step 11 — Verify

```bash
kubectl get all -n ecommerce
kubectl get ingress -n ecommerce

# Check logs
kubectl logs -n ecommerce -l app=backend -f
kubectl logs -n ecommerce -l app=frontend -f
kubectl logs -n ecommerce -l app=mongo -f
```

---

## Secrets Flow Summary

```
AWS Secrets Manager
  ecommerce/mongodb-secrets ──► SecretProviderClass (mongodb-secret-provider) ──► K8s Secret (mongodb-secret) ──► mongo-deployment
  ecommerce/backend-secrets  ──► SecretProviderClass (backend-secret-provider)  ──► K8s Secret (backend-secret)  ──► backend-deployment
  ecommerce/frontend-secrets ──► SecretProviderClass (frontend-secret-provider) ──► K8s Secret (frontend-secret) ──► frontend-deployment
```

> K8s Secrets are created automatically when the pod mounts the CSI volume. No manual `kubectl create secret` needed.

IAM permission chain:
```
secrets-policy (Terraform)
        │
        └── attached to secrets-role (IRSA)
                │
                └── bound to secret-manager-sa (ServiceAccount)
                        │
                        └── used by all pods (mongo, backend, frontend)
```

---

## Cleanup

```bash
kubectl delete namespace ecommerce
eksctl delete cluster -f eks-cluster.yml
cd terraform && terraform destroy --auto-approve
```
