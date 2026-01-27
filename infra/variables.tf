variable "project"               { type = string  default = "huntech" }
variable "environment"           { type = string  default = "dev" }
variable "aws_region"            { type = string  default = "us-east-2" }

variable "domain"                { type = string  default = "" }
variable "hosted_zone_id"        { type = string  default = "" }
variable "mapbox_public_token"   { type = string  default = "" }
variable "stripe_secret_key"     { type = string  default = ""  sensitive = true }
