terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "6.14.1"
    }
    kubernetes = {
      source = "hashicorp/kubernetes"
      version = "2.38.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "kubernetes" {
  host                   = aws_eks_cluster.ecommerce-eks-cluster.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.ecommerce-eks-cluster.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.ecommerce.token
}

data "aws_eks_cluster_auth" "ecommerce" {
  name = aws_eks_cluster.ecommerce-eks-cluster.name
}