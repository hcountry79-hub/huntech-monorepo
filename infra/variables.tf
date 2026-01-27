variable "project"              { type = string }
variable "environment"          { type = string  default = "dev" }
variable "aws_region"           { type = string  default = "us-east-2" }

variable "domain"               { type = string }
variable "hosted_zone_id"       { type = string }

variable "mapbox_public_token"  { type = string }
variable "stripe_secret_key"    { type = string  sensitive = true }
