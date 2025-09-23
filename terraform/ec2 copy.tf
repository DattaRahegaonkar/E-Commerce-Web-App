
# resource "aws_key_pair" "my_key" {
#     key_name   = "my_key"
#     public_key = file("terra-key.pub")
# }

# data "aws_vpc" "default" {
#   default = true
# }


# resource aws_security_group default_sg {

#     name = "default_sg"
#     description = "Default security group for the instance"
#     vpc_id = data.aws_vpc.default.id

#     tags = {
#         Name = "sonarqube_sg"
#     }

#     # Inbound rules for the security group

#     ingress {
#         from_port = 22
#         to_port = 22
#         protocol = "tcp"
#         cidr_blocks = ["0.0.0.0/0"]
#         description = "Allow SSH access"
#     }

#     ingress {
#         from_port = 9000
#         to_port = 9000
#         protocol = "tcp"
#         cidr_blocks = ["0.0.0.0/0"]
#         description = "Allow HTTP access on port 9000"
#     }

#     # Outbound rules for the security group

#     egress {
#         from_port = 0
#         to_port = 0
#         protocol = "-1"
#         cidr_blocks = ["0.0.0.0/0"]
#         description = "Allow all outbound traffic"
#     }
# }


# resource aws_instance sonarqube_ec2_instance {
    
#     key_name = aws_key_pair.my_key.key_name
#     vpc_security_group_ids = [aws_security_group.default_sg.id]
#     ami = "ami-0bc691261a82b32bc"
#     instance_type = "t2.medium"

#     user_data = file("install.sh")


#     # configure a storage 
#     volume_tags = {
#         Name = "sonarqube EC2 Volume"
#     }
    
#     root_block_device {
#         volume_size = "20"
#         volume_type = "gp3"
#         delete_on_termination = true
#     }

#     tags = {
#         Name = "sonarqube"
#     }
# }

# resource "aws_eip" "sonarqube_eip" {
#   instance = aws_instance.sonarqube_ec2_instance.id
# }

# output "sonarqube_eip" {
#   value = aws_eip.sonarqube_eip.public_ip
# }