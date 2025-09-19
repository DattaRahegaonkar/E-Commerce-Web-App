

resource "aws_eip" "nat_eip" {

    domain = "vpc"

    tags = {
        Name = "nat_eip"
        Environment = "dev"
    }
}


resource "aws_nat_gateway" "nat_gateway" {

    allocation_id = aws_eip.nat_eip.id

    subnet_id = aws_subnet.baston_subnet.id

    tags = {
        Name = "nat_gateway"
        Environment = "dev"
    }

}