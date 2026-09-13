# --------------------------- Bastion Host Public IP ---------------------------

output "bastion_host_public_ip" {
  value = aws_instance.bastion-host-tf.public_ip
}

# --------------------------- VPC ID ---------------------------

output "vpc_id" {
  value = aws_vpc.vpc-tf.id
}

# --------------------------- Private Subnet IDs ---------------------------

output "private_subnet_1a_id" {
  value = aws_subnet.private-subnet-1a-tf.id
}

output "private_subnet_1b_id" {
  value = aws_subnet.private-subnet-1b-tf.id
}

# --------------------------- Public Subnet IDs ---------------------------

output "public_subnet_1a_id" {
  value = aws_subnet.public-subnet-1a-tf.id
}

output "public_subnet_1b_id" {
  value = aws_subnet.public-subnet-1b-tf.id
}

