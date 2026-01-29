############################################
# EXAMPLE RESOURCE: WAFv2 for CloudFront
# - CloudFront-scope WAF must be managed in us-east-1.
############################################

resource "aws_wafv2_web_acl" "global" {
  provider    = aws.use1
  name        = "${var.project}-global-waf"
  scope       = "CLOUDFRONT"
  description = "Global WAF for CloudFront"

  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project}-global-waf"
    sampled_requests_enabled   = true
  }

  # Example: empty rules set for now; add managed rule groups later
  # rule { ... }
}

############################################
# (Add the rest of your resources below)
############################################
