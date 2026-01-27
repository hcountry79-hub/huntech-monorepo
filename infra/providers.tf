provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
    }
  }
}

# (Optional for later) Add aliased providers here if you need multiple regions/accounts.
# provider "aws" {
#   alias  = "use1"
#   region = "us-east-1"
# }
