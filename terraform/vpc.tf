
# --------------------------- Create a VPC ---------------------------

resource "aws_vpc" "vpc-tf" {
    cidr_block = "10.0.0.0/16"
    instance_tenancy = "default"
    enable_dns_support = true
    enable_dns_hostnames = true

    tags = {
        Name = "ecommerce-vpc"
    }
}

# --------------------------- Create subnets ---------------------------

# public subnets for eu-west-1a, eu-west-1b

resource "aws_subnet" "public-subnet-1a-tf" {

    vpc_id = aws_vpc.vpc-tf.id
    cidr_block = "10.0.0.0/24"
    map_public_ip_on_launch = true

    availability_zone = "eu-west-1a"

    tags = {
        Name = "public-subnet-1a"
        "kubernetes.io/role/elb"                 = "1"
        "kubernetes.io/cluster/eks-cluster" = "shared"
    }
}

resource "aws_subnet" "public-subnet-1b-tf" {

    vpc_id = aws_vpc.vpc-tf.id
    cidr_block = "10.0.1.0/24"
    map_public_ip_on_launch = true

    availability_zone = "eu-west-1b"

    tags = {
        Name = "public-subnet-1b"
        "kubernetes.io/role/elb"                 = "1"
        "kubernetes.io/cluster/eks-cluster" = "shared"
    }
}

# private subnets for eu-west-1a, eu-west-1b

resource "aws_subnet" "private-subnet-1a-tf" {

    vpc_id = aws_vpc.vpc-tf.id
    cidr_block = "10.0.2.0/24"
    map_public_ip_on_launch = false

    availability_zone = "eu-west-1a"

    tags = {
        Name = "private-subnet-1a"
        "kubernetes.io/role/internal-elb"        = "1"
        "kubernetes.io/cluster/eks-cluster" = "shared"
    }
}

resource "aws_subnet" "private-subnet-1b-tf" {

    vpc_id = aws_vpc.vpc-tf.id
    cidr_block = "10.0.3.0/24"
    map_public_ip_on_launch = false

    availability_zone = "eu-west-1b"

    tags = {
        Name = "private-subnet-1b"
        "kubernetes.io/role/internal-elb"        = "1"
        "kubernetes.io/cluster/eks-cluster" = "shared"
    }
}

# --------------------------- Create an Internet Gateway and Nat Gateway ---------------------------

resource "aws_internet_gateway" "internet_gateway" {

    vpc_id = aws_vpc.vpc-tf.id

    tags = {
        Name = "internet-gateway"
    }

}

# --------------------------- Create elastic IPs for NAT Gateways ---------------------------

resource "aws_eip" "nat-eip-1a-tf" {
    domain = "vpc"

    tags = {
        Name = "nat-eip-1a"
    }
}

resource "aws_eip" "nat-eip-1b-tf" {
    domain = "vpc"

    tags = {
        Name = "nat-eip-1b"
    }
}

# --------------------------- Create NAT Gateways ---------------------------

resource "aws_nat_gateway" "nat_gateway-1a-tf" {

    allocation_id = aws_eip.nat-eip-1a-tf.id

    subnet_id = aws_subnet.public-subnet-1a-tf.id

    depends_on = [
        aws_internet_gateway.internet_gateway
    ]

    tags = {
        Name = "nat_gateway-1a"
    }

}

resource "aws_nat_gateway" "nat_gateway-1b-tf" {

    allocation_id = aws_eip.nat-eip-1b-tf.id

    subnet_id = aws_subnet.public-subnet-1b-tf.id

    depends_on = [
        aws_internet_gateway.internet_gateway
    ]

    tags = {
        Name = "nat_gateway-1b"
    }

}

# --------------------------- public Route Tables ---------------------------

resource "aws_default_route_table" "main-rt-tf" {
  default_route_table_id = aws_vpc.vpc-tf.default_route_table_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet_gateway.id
  }

  tags = {
    Name = "Main-Route-Table"
  }
}


resource "aws_route_table_association" "public-route-table-association-1a-tf" {
  subnet_id = aws_subnet.public-subnet-1a-tf.id
  route_table_id = aws_default_route_table.main-rt-tf.id
}

resource "aws_route_table_association" "public-route-table-association-1b-tf" {
  subnet_id = aws_subnet.public-subnet-1b-tf.id
  route_table_id = aws_default_route_table.main-rt-tf.id
}


# --------------------------- Private Route Tables ---------------------------

resource "aws_route_table" "private-rt-1a-tf" {

  vpc_id = aws_vpc.vpc-tf.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateway-1a-tf.id
  }

  tags = {
    Name        = "private-rt-1a"
  }
}

resource "aws_route_table" "private-rt-1b-tf" {

  vpc_id = aws_vpc.vpc-tf.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateway-1b-tf.id
  }

  tags = {
    Name        = "private-rt-1b"
  }
}

resource "aws_route_table_association" "private-route-table-association-1a-tf" {
  subnet_id      = aws_subnet.private-subnet-1a-tf.id
  route_table_id = aws_route_table.private-rt-1a-tf.id
}

resource "aws_route_table_association" "private-route-table-association-1b-tf" {
  subnet_id      = aws_subnet.private-subnet-1b-tf.id
  route_table_id = aws_route_table.private-rt-1b-tf.id
}

