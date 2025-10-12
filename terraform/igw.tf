# --------------------------- Internet Gateway ---------------------------

resource "aws_internet_gateway" "internet_gateway" {

    vpc_id = aws_vpc.vpc.id

    tags = {
        Name = "internet_gateway_${var.env}"
        Environment = var.env
    }

}
