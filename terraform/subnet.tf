
resource "aws_subnet" "baston_subnet" {
    vpc_id = aws_vpc.vpc.id
    cidr_block = "10.0.1.0/24"
    map_public_ip_on_launch = true

    availability_zone = "eu-west-1a"

    tags = {
        Name = "baston_subnet"
        Environment = "dev"
    }

}


resource "aws_subnet" "backend_subnet" {
    vpc_id = aws_vpc.vpc.id
    cidr_block = "10.0.2.0/24"
    map_public_ip_on_launch = false

    availability_zone = "eu-west-1a"

    tags = {
        Name = "backend_subnet"
        Environment = "dev"
    }

}

resource "aws_subnet" "db_subnet" {
    vpc_id = aws_vpc.vpc.id
    cidr_block = "10.0.3.0/24"
    map_public_ip_on_launch = false

    availability_zone = "eu-west-1a"

    tags = {
        Name = "db_subnet"
        Environment = "dev"
    }

}