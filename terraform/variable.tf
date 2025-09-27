
variable "region" {
    description = "region name"
    default = "eu-west-1"
}

variable "env" {
    description = "environment name"
    default = "dev"
}

variable "ami" {
    description = "ami id"
    default = "ami-0bc691261a82b32bc"
}

variable "instance_type" {
    description = "instance type"
    default = "t3.micro"
}