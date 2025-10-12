
# --------------------------- Create an IAM Role for EKS Cluster ---------------------------

resource "aws_iam_role" "eks-cluster-role" {
  name = "eks-cluster-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "sts:AssumeRole",
          "sts:TagSession"
        ]
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cluster_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks-cluster-role.name
}

# --------------------------- Create EKS Cluster ---------------------------

resource "aws_eks_cluster" "ecommerce-eks-cluster" {
  name = "ecommerce-eks-cluster"

  access_config {
    authentication_mode = "API_AND_CONFIG_MAP"
    bootstrap_cluster_creator_admin_permissions = true
  }

  role_arn = aws_iam_role.eks-cluster-role.arn
  version  = "1.31"

  vpc_config {
    subnet_ids = concat(
      [for s in aws_subnet.public_subnet : s.id],
      [for s in aws_subnet.private_subnet : s.id]
    )
    security_group_ids = [aws_security_group.eks_cluster_sg.id]
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  depends_on = [
    aws_iam_role_policy_attachment.cluster_AmazonEKSClusterPolicy,
  ]
}

# --------------------------- Create an IAM Role for EKS Node Group ---------------------------

resource "aws_iam_role" "eks-node-group-role" {
  name = "eks-node-group-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })
}


resource "aws_iam_role_policy_attachment" "example-AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks-node-group-role.name
}


resource "aws_iam_role_policy_attachment" "example-AmazonEKS_CNI_Policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks-node-group-role.name
}


resource "aws_iam_role_policy_attachment" "example-AmazonEC2ContainerRegistryReadOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks-node-group-role.name
}

# --------------------------- Create EKS Node Group ---------------------------

resource "aws_key_pair" "eks_key_pair" {
  key_name   = "eks-key" # change this
  public_key = file("eks-key.pub") # change this if your public key is elsewhere
}

resource "aws_eks_node_group" "ecommerce-node-group" {
  cluster_name    = aws_eks_cluster.ecommerce-eks-cluster.name
  node_group_name = "ecommerce-node-group"
  node_role_arn   = aws_iam_role.eks-node-group-role.arn

  subnet_ids = [for s in aws_subnet.private_subnet : s.id]

  remote_access {
    ec2_ssh_key               = aws_key_pair.eks_key_pair.key_name
    source_security_group_ids = [aws_security_group.eks_cluster_sg.id]
  }

  force_update_version = true
  disk_size          = 20

  scaling_config {
    desired_size = 1
    max_size     = 2
    min_size     = 1
  }

  instance_types = ["t3.medium"]

  tags = {
    Name = "ecommerce-node-group"
  }

  depends_on = [
    aws_eks_cluster.ecommerce-eks-cluster,
    aws_iam_role_policy_attachment.example-AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.example-AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.example-AmazonEC2ContainerRegistryReadOnly,
  ]
}

# Helps destroy succeed (avoids dependency race with ENIs, LoadBalancers, etc.)
resource "time_sleep" "wait_for_aws_cleanup" {
  depends_on = [
    aws_eks_node_group.ecommerce-node-group,
    aws_eks_cluster.ecommerce-eks-cluster
  ]
  create_duration = "120s"
}

output "cluster_endpoint" {
  value = aws_eks_cluster.ecommerce-eks-cluster.endpoint
}
