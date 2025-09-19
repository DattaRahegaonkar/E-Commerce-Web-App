

resource "aws_key_pair" "my_key" {
    key_name   = "my_key"
    public_key = file("terra-key.pub")
}

resource "aws_instance" "baston_host" {

    ami = "ami-0bc691261a82b32bc"

    instance_type = "t3.micro"

    subnet_id = aws_subnet.baston_subnet.id

    vpc_security_group_ids = [aws_security_group.baston_sg.id]

    key_name = aws_key_pair.my_key.key_name

    tags = {
        Name = "Baston_Host"
        Environment = "dev"
    }

}


resource "aws_instance" "backend_server" {

    ami = "ami-0bc691261a82b32bc"

    instance_type = "t3.micro"

    subnet_id = aws_subnet.backend_subnet.id

    vpc_security_group_ids = [aws_security_group.backend_sg.id]

    key_name = aws_key_pair.my_key.key_name

    tags = {
        Name = "backend_server"
        Environment = "dev"
    }

}


resource "aws_instance" "db_server" {

    ami = "ami-0bc691261a82b32bc"

    instance_type = "t3.micro"

    subnet_id = aws_subnet.db_subnet.id

    vpc_security_group_ids = [aws_security_group.db_sg.id]

    key_name = aws_key_pair.my_key.key_name

    tags = {
        Name = "db_server"
        Environment = "dev"
    }

}