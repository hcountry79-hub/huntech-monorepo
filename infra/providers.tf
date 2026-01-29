# Primary provider (region used by most resources)
provider "aws" {
  region = var.aws_region
}

# Alias specifically for resources that MUST be in us-east-1 (e.g., WAF for CloudFront)
provider "aws" {
  alias  = "use1"
  region = "us-east-1"
}
