variable "project" {
  type    = string
  default = "huntech"
}

# For general AWS resources you can change this later.
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "domain" {
  type    = string
  default = "huntechusa.com"
}

variable "hosted_zone_id" {
  type    = string
  default = ""
}

variable "mapbox_public_token" {
  type    = string
  default = ""
}

variable "stripe_secret_key" {
  type      = string
  default   = ""
  sensitive = true
}
