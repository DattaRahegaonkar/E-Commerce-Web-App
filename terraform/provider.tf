terraform {
  required_providers {
    local = {
      source  = "hashicorp/local"
    }
  }
}

provider "aws" {
  region = "eu-west-1"
}
