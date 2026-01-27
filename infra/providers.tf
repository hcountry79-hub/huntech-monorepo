provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
    }
  }
}

# (Optional extra regions/accounts use aliases, e.g.):
# provider "aws" {
#   alias  = "use1"
#   region = "us-east-1"
# }
