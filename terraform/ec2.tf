

resource "aws_key_pair" "terra_key" {
    key_name   = "terra_key"
    public_key = file("terra-key.pub")
}

resource "aws_instance" "baston_host" {

    ami = var.ami

    instance_type = var.instance_type

    subnet_id = aws_subnet.baston_subnet.id

    vpc_security_group_ids = [aws_security_group.baston_sg.id]

    key_name = aws_key_pair.terra_key.key_name

    tags = {
        Name = "${var.env}-Baston_Host"
        Environment = var.env
    }

}

resource "aws_eip" "baston_host_eip" {
    instance = aws_instance.baston_host.id
}


resource "aws_instance" "backend_server" {

    ami = var.ami

    instance_type = var.instance_type

    subnet_id = aws_subnet.backend_subnet.id

    vpc_security_group_ids = [aws_security_group.backend_sg.id]

    key_name = aws_key_pair.terra_key.key_name

    tags = {
        Name = "${var.env}-backend_server"
        Environment = var.env
    }

}


resource "aws_instance" "db_server" {

    ami = var.ami

    instance_type = var.instance_type

    subnet_id = aws_subnet.db_subnet.id

    vpc_security_group_ids = [aws_security_group.db_sg.id]

    key_name = aws_key_pair.terra_key.key_name

    tags = {
        Name = "${var.env}-db_server"
        Environment = var.env
    }

}