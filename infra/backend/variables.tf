
variable "project"    { type = string  default = "huntech" }
variable "aws_region"  { type = string  default = "us-east-1" }

# Cognito authorizer inputs (resolved by workflow)
variable "cognito_issuer"   { type = string  default = "" }
variable "cognito_audience" { type = string  default = "" }

# DynamoDB table names (override if needed)
variable "users_table"     { type = string  default = "HUNTECH-Users" }
variable "properties_table"{ type = string  default = "HUNTECH-Properties" }
variable "pins_table"      { type = string  default = "HUNTECH-Pins" }
variable "journals_table"  { type = string  default = "HUNTECH-Journals" }
