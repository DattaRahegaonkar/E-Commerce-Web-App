

resource "aws_eip" "nat_eip" {

    domain = "vpc"

    tags = {
        Name = "${var.env}-nat_eip"
        Environment = var.env
    }
}


resource "aws_nat_gateway" "nat_gateway" {

    allocation_id = aws_eip.nat_eip.id

    subnet_id = aws_subnet.baston_subnet.id

    tags = {
        Name = "${var.env}-nat_gateway"
        Environment = var.env
    }

}