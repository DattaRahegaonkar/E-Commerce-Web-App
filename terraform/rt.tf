
# public route table creation

resource "aws_route_table" "public_route_table" {

    vpc_id = aws_vpc.vpc.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.internet_gateway.id
    }

    tags = {
        Name = "${var.env}-public_route_table"
        Environment = var.env
    }

}

resource "aws_route_table_association" "public_route_table_association" {

    subnet_id = aws_subnet.baston_subnet.id
    route_table_id = aws_route_table.public_route_table.id

}


# private route table creation


resource "aws_route_table" "private_route_table" {

    vpc_id = aws_vpc.vpc.id

    route {
        cidr_block = "0.0.0.0/0"
        nat_gateway_id = aws_nat_gateway.nat_gateway.id
    }

    tags = {
        Name = "${var.env}-private_route_table"
        Environment = var.env
    }

}

resource "aws_route_table_association" "private_route_table_association_1" {

    subnet_id = aws_subnet.backend_subnet.id
    route_table_id = aws_route_table.private_route_table.id

}

resource "aws_route_table_association" "private_route_table_association_2" {

    subnet_id = aws_subnet.db_subnet.id
    route_table_id = aws_route_table.private_route_table.id

}