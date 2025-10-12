# EKS Cluster Using Terraform

This directory contains Terraform configuration to create a production-ready Amazon EKS cluster with complete VPC infrastructure and sample application deployment.

## Prerequisites

- AWS CLI configured with appropriate credentials
- kubectl installed
- Terraform >= 1.0

## Infrastructure Components

### VPC & Networking (`vpc.tf`)
- **VPC** (10.0.0.0/16) with DNS support enabled
- **Public Subnets** (10.0.1.0/24, 10.0.2.0/24) in eu-west-1a & eu-west-1b
- **Private Subnets** (10.0.3.0/24, 10.0.4.0/24) in eu-west-1a & eu-west-1b
- **Internet Gateway** for public subnet connectivity
- **NAT Gateways** (2) with Elastic IPs for private subnet outbound access
- **Route Tables** with proper associations for public/private routing
- **Kubernetes tags** for ELB and internal-ELB discovery

### Security Groups (`sg.tf`)
- **EKS Cluster Security Group** - HTTPS (443) access
- **EKS Node Security Group** - HTTP/HTTPS and node-to-node communication
- **Load Balancer Security Group** - HTTP/HTTPS from internet
- **Security Group Rules** for cluster-node and node-LB communication

### EKS Resources (`eks.tf`)
- **EKS Cluster** (version 1.31) with API authentication mode
- **EKS Node Group** with auto-scaling (2-4 t3.micro instances) in private subnets
- **IAM Roles** and policy attachments:
  - Cluster role with `AmazonEKSClusterPolicy`
  - Node group role with `AmazonEKSWorkerNodePolicy`, `AmazonEKS_CNI_Policy`, `AmazonEC2ContainerRegistryReadOnly`

### Sample Application (`nginx.yml`)
- **Nginx Deployment** with resource limits
- **LoadBalancer Service** for external access

## Configuration Details

- **Cluster Name:** ecommerce-eks-cluster
- **Kubernetes Version:** 1.31
- **VPC CIDR:** 10.0.0.0/16
- **Node Group:** 2-4 t3.micro instances in private subnets
- **Region:** eu-west-1
- **Availability Zones:** eu-west-1a, eu-west-1b
- **Environment:** dev (configurable via variable)

## Deployment Steps

1. **Initialize Terraform:**
   ```bash
   terraform init
   ```

2. **Review the plan:**
   ```bash
   terraform plan
   ```

3. **Apply configuration:**
   ```bash
   terraform apply --auto-approve
   ```

4. **Configure kubectl:**
   ```bash
   aws eks update-kubeconfig --region eu-west-1 --name ecommerce-eks-cluster
   ```

5. **Verify cluster:**
   ```bash
   kubectl get nodes
   kubectl get svc
   ```

6. **Deploy sample application:**
   ```bash
   kubectl apply -f nginx.yml
   kubectl get pods
   kubectl get svc nginx-service
   ```

## File Structure

```
EKS_Using_Terraform/
├── provider.tf      # AWS provider configuration
├── vpc.tf          # VPC, subnets, gateways, route tables
├── sg.tf           # Security groups and rules
├── eks.tf          # EKS cluster and node group
├── nginx.yml       # Sample Kubernetes application
├── eks-key         # SSH key pair for nodes
└── README.md       # This file
```

## Troubleshooting

**Access Issues:**
1. Go to AWS Console → EKS → Clusters → Access
2. Add your IAM user with `AmazonEKSAdminPolicy`

**Node Issues:**
- Check security group rules between cluster and nodes
- Verify IAM roles have required policies attached

**LoadBalancer Issues:**
- Ensure subnets have proper Kubernetes tags
- Check security group allows traffic from ALB to nodes

## Cleanup

```bash
# Remove Kubernetes resources first
kubectl delete -f nginx.yml

# Destroy Terraform infrastructure
terraform destroy --auto-approve
```

## Outputs

- **VPC ID:** Available after deployment
- **Cluster Endpoint:** EKS API server endpoint
- **LoadBalancer URL:** Available after nginx deployment



kubectl config get-clusters

kubectl config use-context kind-argocd-cluster

kubectl get nodes


kind get kubeconfig --name argocd-cluster > ~/.kube/kind-config

export KUBECONFIG=~/.kube/config:~/.kube/kind-config

kubectl config get-contexts

kubectl config use-context kind-argocd-cluster

kubectl get nodes