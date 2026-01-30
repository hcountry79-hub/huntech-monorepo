
#############################
# DynamoDB Tables
#############################
resource "aws_dynamodb_table" "users" {
  name           = var.users_table
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  attribute { name = "userId" type = "S" }
}

resource "aws_dynamodb_table" "properties" {
  name           = var.properties_table
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "propertyId"
  attribute { name = "propertyId" type = "S" }
  global_secondary_index {
    name            = "ownerId-index"
    hash_key        = "ownerId"
    projection_type = "ALL"
  }
  attribute { name = "ownerId" type = "S" }
}

resource "aws_dynamodb_table" "pins" {
  name           = var.pins_table
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  range_key      = "pinId"
  attribute { name = "userId" type = "S" }
  attribute { name = "pinId"  type = "S" }
}

resource "aws_dynamodb_table" "journals" {
  name           = var.journals_table
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  range_key      = "journalId"
  attribute { name = "userId"   type = "S" }
  attribute { name = "journalId" type = "S" }
}

#############################
# IAM for Lambdas
#############################
resource "aws_iam_role" "lambda_exec" {
  name               = "${var.project}-lambda-exec"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals { type = "Service" identifiers = ["lambda.amazonaws.com"] }
  }
}

resource "aws_iam_role_policy" "lambda_ddb_access" {
  name = "${var.project}-lambda-ddb-access"
  role = aws_iam_role.lambda_exec.id
  policy = data.aws_iam_policy_document.lambda_ddb.json
}

data "aws_iam_policy_document" "lambda_ddb" {
  statement {
    actions = [
      "dynamodb:PutItem","dynamodb:GetItem","dynamodb:Query","dynamodb:UpdateItem","dynamodb:DeleteItem"
    ]
    resources = [
      aws_dynamodb_table.users.arn,
      aws_dynamodb_table.properties.arn,
      aws_dynamodb_table.pins.arn,
      aws_dynamodb_table.journals.arn
    ]
  }
  statement {
    actions = ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"]
    resources = ["*"]
  }
}

#############################
# Package Lambda code
#############################
# journal
data "archive_file" "journal_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../backend/handlers/journal"
  output_path = "${path.module}/.dist/journal.zip"
}

resource "aws_lambda_function" "journal" {
  function_name = "${var.project}-journal"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_exec.arn
  filename      = data.archive_file.journal_zip.output_path
  source_code_hash = data.archive_file.journal_zip.output_base64sha256
  environment { variables = { JOURNAL_TABLE = aws_dynamodb_table.journals.name } }
}

# pins

data "archive_file" "pins_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../backend/handlers/pins"
  output_path = "${path.module}/.dist/pins.zip"
}

resource "aws_lambda_function" "pins" {
  function_name = "${var.project}-pins"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_exec.arn
  filename      = data.archive_file.pins_zip.output_path
  source_code_hash = data.archive_file.pins_zip.output_base64sha256
  environment { variables = { PINS_TABLE = aws_dynamodb_table.pins.name } }
}

#############################
# HTTP API + JWT Authorizer (Cognito)
#############################
resource "aws_apigatewayv2_api" "http" {
  name          = "${var.project}-http"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET","POST","OPTIONS"]
    allow_headers = ["*"]
  }
}

resource "aws_apigatewayv2_authorizer" "jwt" {
  api_id           = aws_apigatewayv2_api.http.id
  name             = "cognito-jwt"
  authorizer_type  = "JWT"
  identity_source  = ["$request.header.Authorization"]
  jwt_configuration {
    issuer   = var.cognito_issuer
    audience = [var.cognito_audience]
  }
}

# Integrations
resource "aws_apigatewayv2_integration" "journal" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.journal.invoke_arn
  payload_format_version = "2.0"
}
resource "aws_apigatewayv2_integration" "pins" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.pins.invoke_arn
  payload_format_version = "2.0"
}

# Routes (secured by JWT)
resource "aws_apigatewayv2_route" "journal_post" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /journal"
  target    = "integrations/${aws_apigatewayv2_integration.journal.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}
resource "aws_apigatewayv2_route" "journal_get" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /journal"
  target    = "integrations/${aws_apigatewayv2_integration.journal.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}
resource "aws_apigatewayv2_route" "pins_post" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /pins"
  target    = "integrations/${aws_apigatewayv2_integration.pins.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}
resource "aws_apigatewayv2_route" "pins_get" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /pins"
  target    = "integrations/${aws_apigatewayv2_integration.pins.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}

# Stage
resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true
}

# Permissions for API to invoke Lambda
resource "aws_lambda_permission" "api_journal" {
  statement_id  = "AllowAPIGatewayInvokeJournal"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.journal.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}
resource "aws_lambda_permission" "api_pins" {
  statement_id  = "AllowAPIGatewayInvokePins"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.pins.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}

output "api_endpoint" { value = aws_apigatewayv2_api.http.api_endpoint }
