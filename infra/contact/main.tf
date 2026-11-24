# Contact form backend for the portfolio: Lambda behind a function URL that emails the owner
# through SES. Least privilege: the role can only send from the one verified identity and write
# to its own log group. SES sandbox (200 mails a day) is the natural abuse cap.

terraform {
  required_version = ">= 1.6"
  required_providers {
    aws     = { source = "hashicorp/aws", version = "~> 6.0" }
    archive = { source = "hashicorp/archive", version = "~> 2.4" }
  }
}

provider "aws" {
  region = var.region
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "owner_email" {
  type        = string
  description = "Verified SES identity: receives the messages and is the From address."
}

variable "allowed_origins" {
  type        = list(string)
  description = "Origins the browser may call the function URL from."
  default     = ["http://localhost:3300", "http://localhost:3111"]
}

resource "aws_sesv2_email_identity" "owner" {
  email_identity = var.owner_email
}

data "archive_file" "handler" {
  type        = "zip"
  source_file = "${path.module}/lambda/handler.py"
  output_path = "${path.module}/build/handler.zip"
}

resource "aws_cloudwatch_log_group" "contact" {
  name              = "/aws/lambda/portfolio-contact"
  retention_in_days = 14
}

data "aws_iam_policy_document" "trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "permissions" {
  statement {
    actions   = ["ses:SendEmail"]
    resources = [aws_sesv2_email_identity.owner.arn]
  }
  statement {
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.contact.arn}:*"]
  }
}

resource "aws_iam_role" "contact" {
  name               = "portfolio-contact"
  assume_role_policy = data.aws_iam_policy_document.trust.json
}

resource "aws_iam_role_policy" "contact" {
  role   = aws_iam_role.contact.id
  policy = data.aws_iam_policy_document.permissions.json
}

resource "aws_lambda_function" "contact" {
  function_name    = "portfolio-contact"
  role             = aws_iam_role.contact.arn
  runtime          = "python3.13"
  handler          = "handler.handler"
  filename         = data.archive_file.handler.output_path
  source_code_hash = data.archive_file.handler.output_base64sha256
  timeout          = 10
  memory_size      = 128

  environment {
    variables = { OWNER_EMAIL = var.owner_email }
  }

  depends_on = [aws_cloudwatch_log_group.contact]
}

resource "aws_lambda_function_url" "contact" {
  function_name      = aws_lambda_function.contact.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = var.allowed_origins
    allow_methods = ["POST"]
    allow_headers = ["content-type"]
    max_age       = 3600
  }
}

# Public function URLs need both permissions since 2025.
resource "aws_lambda_permission" "url" {
  statement_id           = "AllowPublicFunctionUrl"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.contact.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

resource "aws_lambda_permission" "invoke" {
  statement_id             = "AllowInvokeViaFunctionUrl"
  action                   = "lambda:InvokeFunction"
  function_name            = aws_lambda_function.contact.function_name
  principal                = "*"
  invoked_via_function_url = true
}

output "contact_url" {
  value = aws_lambda_function_url.contact.function_url
}
