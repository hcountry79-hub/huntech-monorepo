
locals {
  suffix = substr(replace(uuid(), "-", ""), 0, 8)
  name   = "${var.project}-dev"
}

# KMS key for app data
resource "aws_kms_key" "app" {
  description             = "${local.name} app key"
  deletion_window_in_days = 7
}

# DynamoDB single-table
resource "aws_dynamodb_table" "app" {
  name         = "${local.name}-app"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute { name = "PK" type = "S" }
  attribute { name = "SK" type = "S" }
  attribute { name = "GSI1PK" type = "S" }
  attribute { name = "GSI1SK" type = "S" }

  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  server_side_encryption { enabled = true, kms_key_arn = aws_kms_key.app.arn }
}

# S3 buckets
resource "aws_s3_bucket" "web" { bucket = "${local.name}-web-${local.suffix}" }
resource "aws_s3_bucket" "media" { bucket = "${local.name}-media-${local.suffix}" }
resource "aws_s3_bucket" "logs" { bucket = "${local.name}-logs-${local.suffix}" }

resource "aws_s3_bucket_public_access_block" "all" {
  for_each = { for b in [aws_s3_bucket.web, aws_s3_bucket.media, aws_s3_bucket.logs] : b.id => b }
  bucket                  = each.value.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lambda role
resource "aws_iam_role" "lambda_exec" {
  name               = "${local.name}-lambda-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{ Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Hello handler zip
data "archive_file" "hello" {
  type        = "zip"
  source_dir  = "../../backend/functions/hello"
  output_path = "./hello.zip"
}

resource "aws_lambda_function" "hello" {
  function_name = "${local.name}-hello"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  filename      = data.archive_file.hello.output_path
  environment { variables = { TABLE = aws_dynamodb_table.app.name } }
}

# API Gateway HTTP API
resource "aws_apigatewayv2_api" "http" {
  name          = "${local.name}-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "hello" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.hello.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "hello" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.hello.id}"
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.hello.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}

# Cognito User Pool
resource "aws_cognito_user_pool" "pool" {
  name = "HUNTECH-auth-dev"
  username_attributes = ["email"]
  mfa_configuration   = "OPTIONAL"
  # Advanced security (aka threat protection) mode can be set via console or plus plan; manual toggle may be required.
}

resource "aws_cognito_user_pool_client" "web" {
  name                         = "${local.name}-web"
  user_pool_id                 = aws_cognito_user_pool.pool.id
  generate_secret              = false
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows         = ["code"]
  allowed_oauth_scopes        = ["email","openid","profile"]
  callback_urls               = ["https://app.${var.domain}/auth/callback"]
  logout_urls                 = ["https://app.${var.domain}/"]
  supported_identity_providers = ["COGNITO"]
}

# CloudFront + S3 static web origin (web app published to S3)
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${local.name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.web.bucket_regional_domain_name
    origin_id   = "s3-web"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET","HEAD"]
    cached_methods   = ["GET","HEAD"]
    target_origin_id = "s3-web"
    viewer_protocol_policy = "redirect-to-https"
  }

  price_class = "PriceClass_100"

  restrictions { geo_restriction { restriction_type = "none" } }

  viewer_certificate { cloudfront_default_certificate = true }
}

# WAF (global) with AWS Managed Rules
resource "aws_wafv2_web_acl" "global" {
  name        = "${local.name}-waf"
  description = "Baseline protection"
  scope       = "CLOUDFRONT"
  default_action { allow {} }
  visibility_config { cloudwatch_metrics_enabled = true metric_name = "${local.name}-waf" sampled_requests_enabled = true }

  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1
    override_action { none {} }
    statement { managed_rule_group_statement { name = "AWSManagedRulesCommonRuleSet" vendor_name = "AWS" } }
    visibility_config { cloudwatch_metrics_enabled = true metric_name = "common" sampled_requests_enabled = true }
  }
}

resource "aws_wafv2_web_acl_association" "cf" {
  resource_arn = aws_cloudfront_distribution.cdn.arn
  web_acl_arn  = aws_wafv2_web_acl.global.arn
}

# Budget alert (cost guardrail)
resource "aws_budgets_budget" "monthly" {
  name              = "${local.name}-monthly-budget"
  budget_type       = "COST"
  limit_amount      = "50"
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
}

output "api_url" { value = aws_apigatewayv2_api.http.api_endpoint }
output "cloudfront_domain" { value = aws_cloudfront_distribution.cdn.domain_name }
output "cognito_user_pool_id" { value = aws_cognito_user_pool.pool.id }
output "cognito_app_client_id" { value = aws_cognito_user_pool_client.web.id }
