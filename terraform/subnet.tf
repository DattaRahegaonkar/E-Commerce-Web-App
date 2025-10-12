# public subnets for eu-west-1a, eu-west-1b

resource "aws_subnet" "public_subnet" {

    for_each = {
        "1a" = {
            cidr = var.public_subnets[0]
            az = var.availability_zones[0]
        }
        "1b" = {
            cidr = var.public_subnets[1]
            az = var.availability_zones[1]
        }
    }

    vpc_id = aws_vpc.vpc.id
    cidr_block = each.value.cidr
    map_public_ip_on_launch = true

    availability_zone = each.value.az

    tags = {
        Name = "public-subnet-${each.key}-${var.env}"
        Environment = var.env
        "kubernetes.io/role/elb"                 = "1"
        "kubernetes.io/cluster/ecommerce-eks-cluster" = "shared"
    }
}

# private subnets for eu-west-1a, eu-west-1b

resource "aws_subnet" "private_subnet" {

    for_each = {
        "1a" = {
            cidr = var.private_subnets[0]
            az = var.availability_zones[0]
        }
        "1b" = {
            cidr = var.private_subnets[1]
            az = var.availability_zones[1]
        }
    }

    vpc_id = aws_vpc.vpc.id
    cidr_block = each.value.cidr
    map_public_ip_on_launch = false

    availability_zone = each.value.az

    tags = {
        Name = "private-subnet-${each.key}-${var.env}"
        Environment = var.env
        "kubernetes.io/role/internal-elb"        = "1"
        "kubernetes.io/cluster/ecommerce-eks-cluster" = "shared"
    }
}