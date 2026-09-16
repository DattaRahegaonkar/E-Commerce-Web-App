data "aws_caller_identity" "current" {}

resource "local_file" "eks_cluster_config" {
  content = templatefile("${path.module}/eks-cluster.yaml.tpl", {
    vpc_id               = aws_vpc.vpc-tf.id
    public_subnet_1a_id  = aws_subnet.public-subnet-1a-tf.id
    public_subnet_1b_id  = aws_subnet.public-subnet-1b-tf.id
    private_subnet_1a_id = aws_subnet.private-subnet-1a-tf.id
    private_subnet_1b_id = aws_subnet.private-subnet-1b-tf.id
    account_id           = data.aws_caller_identity.current.account_id
  })
  filename = "${path.module}/eks-cluster.yaml"
}

resource "null_resource" "copy_eks_config" {
  triggers = {
    eks_config = local_file.eks_cluster_config.content
  }

  connection {
    type        = "ssh"
    host        = aws_instance.bastion-host-tf.public_ip
    user        = "ubuntu"
    private_key = file("${path.module}/baston-key")
  }

  provisioner "file" {
    source      = "${path.module}/eks-cluster.yaml"
    destination = "/home/ubuntu/eks-cluster.yaml"
  }

  depends_on = [
    aws_instance.bastion-host-tf,
    local_file.eks_cluster_config
  ]
}
