
output "vpc_id" {
    value = aws_vpc.vpc.id
}

output "baston_subnet_id" {
    value = aws_subnet.baston_subnet.id
}

output "backend_subnet_id" {
    value = aws_subnet.backend_subnet.id
}

output "db_subnet_id" {
    value = aws_subnet.db_subnet.id
}

output "baston_host_public_ip" {
  value = aws_instance.baston_host.public_ip
}

output "backend_server_private_ip" {
  value = aws_instance.backend_server.private_ip
}

output "db_server_private_ip" {
    value = aws_instance.db_server.private_ip
}