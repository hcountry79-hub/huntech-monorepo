# Root module: keep ONLY resources/data/modules/outputs here.
data "aws_caller_identity" "current" {}

output "aws_account_id" {
  value = data.aws_caller_identity.current.account_id
}
