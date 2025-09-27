

output "baston_host_public_eip" {
  value = aws_eip.baston_host_eip.public_ip
}

output "backend_server_private_ip" {
  value = aws_instance.backend_server.private_ip
}

output "db_server_private_ip" {
    value = aws_instance.db_server.private_ip
}