
# --------------------------- public Route Tables ---------------------------

resource "aws_route_table" "public_route_table" {

    vpc_id = aws_vpc.vpc.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.internet_gateway.id
    }

    tags = {
        Name = "public-route-table-${var.env}"
        Environment = var.env
    }

}

resource "aws_route_table_association" "public_route_table_association_1a" {

    for_each = aws_subnet.public_subnet

    subnet_id = each.value.id
    route_table_id = aws_route_table.public_route_table.id

}

# --------------------------- Private Route Tables ---------------------------

# Create one private route table for each private subnet

resource "aws_route_table" "private" {
  for_each = aws_subnet.private_subnet

  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = lookup(
      {
        "1a" = aws_nat_gateway.nat_gateway["1a"].id
        "1b" = aws_nat_gateway.nat_gateway["1b"].id
      },
      each.key
    )
  }

  tags = {
    Name        = "private-rt-${each.key}-${var.env}"
    Environment = var.env
  }
}

resource "aws_route_table_association" "private" {
  for_each = aws_subnet.private_subnet

  subnet_id      = each.value.id
  route_table_id = aws_route_table.private[each.key].id
}