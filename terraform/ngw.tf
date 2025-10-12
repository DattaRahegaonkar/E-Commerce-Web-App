

# --------------------------- Create elastic IPs and NAT Gateways ---------------------------

resource "aws_eip" "nat_eip" {

    for_each = {
    "1a" = var.availability_zones[0]
    "1b" = var.availability_zones[1]
    }

    domain = "vpc"

    tags = {
        Name = "nat-eip-${each.key}-${var.env}"
        Environment = var.env
    }
}

# --------------------------- Create NAT Gateways ---------------------------

resource "aws_nat_gateway" "nat_gateway" {

    for_each = {
        "1a" = aws_subnet.public_subnet["1a"].id
        "1b" = aws_subnet.public_subnet["1b"].id
    }

    allocation_id = aws_eip.nat_eip[each.key].id

    subnet_id = each.value

    tags = {
        Name = "nat_gateway-${each.key}-${var.env}"
        Environment = var.env
    }

}
