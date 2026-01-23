
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project" {
  type    = string
  default = "huntech"
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
  type    = string
  default = ""
}
