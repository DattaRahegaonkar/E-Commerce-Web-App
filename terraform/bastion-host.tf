
resource "aws_key_pair" "baston-key-pair-tf" {
  key_name   = "baston-key"
  public_key = file("baston-key.pub")
}

resource "aws_security_group" "bastion-sg-tf" {

  name        = "bastion-sg"
  description = "Security group for bastion host"

  vpc_id = aws_vpc.vpc-tf.id

  ingress {
    description = "SSH"
    from_port = 22
    to_port   = 22
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Jenkins"
    from_port = 8080
    to_port   = 8080
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port = 0
    to_port   = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "bastion-sg"
  }
}

resource "aws_instance" "bastion-host-tf" {
  ami           = "ami-06468be052a4195a6"
  instance_type = "c7i-flex.large"
  subnet_id     = aws_subnet.public-subnet-1a-tf.id
  key_name      = aws_key_pair.baston-key-pair-tf.key_name

  security_groups = [aws_security_group.bastion-sg-tf.id]

  user_data = file("install.sh")

  root_block_device {
    volume_size = 25
    volume_type = "gp3"
  }

  tags = {
    Name = "bastion-host"
  }
}