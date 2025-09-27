
resource "aws_key_pair" "my_key" {
    key_name   = "my_key"
    public_key = file("terra-key.pub")
}

data "aws_vpc" "default" {
  default = true
}


resource aws_security_group default_sg {

    name = "default_sg"
    description = "Default security group for the instance"
    vpc_id = data.aws_vpc.default.id

    tags = {
        Name = "demo_sg"
    }

    # Inbound rules for the security group

    ingress {
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
        description = "Allow SSH access"
    }

    ingress {
        from_port = 8080
        to_port = 8080
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
        description = "Allow 8080 access"
    }

    # Outbound rules for the security group

    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
        description = "Allow all outbound traffic"
    }
}

resource aws_instance jenkins_master_instance {
    
    key_name = aws_key_pair.my_key.key_name
    vpc_security_group_ids = [aws_security_group.default_sg.id]
    ami = "ami-0bc691261a82b32bc"
    instance_type = "t2.medium"

    user_data = file("install.sh")


    # configure a storage 
    volume_tags = {
        Name = "Master EC2 Volume"
    }
    
    root_block_device {
        volume_size = "15"
        volume_type = "gp3"
        delete_on_termination = true
    }

    tags = {
        Name = "Jenkins_Master"
    }
}

output "jenkins_master_instance" {
  value = aws_instance.jenkins_master_instance.public_ip
}