
provider "aws" {
  region = var.aws_region
}

# For CloudFront/WAF global if needed later
provider "aws" {
  alias  = "use1"
  region = "us-east-1"
}
