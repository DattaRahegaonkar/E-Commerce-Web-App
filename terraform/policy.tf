

resource "aws_iam_policy" "secrets_policy_tf" {
  name        = "secrets-policy"
  description = "Allow pod to read secret from AWS Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]

        Resource = "arn:aws:secretsmanager:eu-west-1:${data.aws_caller_identity.current.account_id}:secret:ecommerce/*"
      }
    ]
  })
}
