
resource "aws_vpc" "vpc" {

    cidr_block = "10.0.0.0/16"
    instance_tenancy = "default"

    tags = {
        Name = "${var.env}-vpc"
        Environment = var.env
    }

}