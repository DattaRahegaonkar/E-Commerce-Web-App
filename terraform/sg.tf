
# --------------------------- Create Security Groups for EKS ---------------------------

resource "aws_security_group" "eks_cluster_sg" {
  name        = "eks-cluster-sg-${var.env}"
  description = "Security group for EKS cluster"
  vpc_id      = aws_vpc.vpc.id

  ingress { 
    from_port = 443
    to_port = 443
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "eks-cluster-sg-${var.env}"
  }
}

# --------------------------- Create Security Groups for EKS Nodes ---------------------------

resource "aws_security_group" "eks_node_sg" {
  name        = "eks-node-sg-${var.env}"
  description = "Security group for EKS nodes"
  vpc_id      = aws_vpc.vpc.id

  # Allow HTTP/HTTPS for LoadBalancer (adjust CIDR for production)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Node-to-node communication
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "eks-node-sg-${var.env}"
  }
}

# --------------------------- Create Security Groups for EKS Load Balancer ---------------------------

resource "aws_security_group" "eks_lb_sg" {
  name        = "eks-lb-sg-${var.env}"
  description = "Security group for EKS Load Balancer"
  vpc_id      = aws_vpc.vpc.id

  # Allow HTTP from anywhere
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTPS from anywhere (optional)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "eks-lb-sg-${var.env}"
  }
}


# Allow nodes to communicate with cluster (control plane)
resource "aws_security_group_rule" "cluster_ingress_from_nodes" {
  type                     = "ingress"
  from_port                = 0
  to_port                  = 0
  protocol                 = "-1"
  security_group_id        = aws_security_group.eks_cluster_sg.id
  source_security_group_id = aws_security_group.eks_node_sg.id
}

# Allow cluster to communicate with nodes
resource "aws_security_group_rule" "node_ingress_from_cluster" {
  type                     = "ingress"
  from_port                = 0
  to_port                  = 0
  protocol                 = "-1"
  security_group_id        = aws_security_group.eks_node_sg.id
  source_security_group_id = aws_security_group.eks_cluster_sg.id
}

# Allow load balancer to communicate with nodes on port 80
resource "aws_security_group_rule" "node_ingress_from_lb" {
  type                     = "ingress"
  from_port                = 80
  to_port                  = 80
  protocol                 = "tcp"
  security_group_id        = aws_security_group.eks_node_sg.id
  source_security_group_id = aws_security_group.eks_lb_sg.id
}
