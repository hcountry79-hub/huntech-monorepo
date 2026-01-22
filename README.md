
# HUNTΞCH Monorepo

Production-ready scaffolding for the HUNTΞCH app. Generated 2026-01-22 19:49 UTC.

## Quick Start (Dev)

1. **Set repo secrets/vars** in GitHub → Settings → Security → Secrets and variables → **Actions**:
   - `AWS_ACCOUNT_ID` (12 digits)
   - `AWS_REGION` = `us-east-1`
   - `CLOUDFRONT_CERT_DOMAIN` = `huntechusa.com` (wildcard `*.huntechusa.com` if desired)
   - `HOSTED_ZONE_ID` for `huntechusa.com` (Route 53). If your DNS is elsewhere, set the records manually.
   - `MAPBOX_PUBLIC_TOKEN`
   - `STRIPE_SECRET_KEY` (test key for dev)

2. **Create IAM OIDC role** in your AWS account (see `infra/iam/github-oidc-role.json` & `infra/iam/github-oidc-trust.json`). Name suggestion: `HUNTECH-GitHubOIDC-Deploy`.

3. Push to `main`. GitHub Actions will:
   - Plan & apply Terraform in `infra/terraform`
   - Build & deploy the **backend** Lambdas & API Gateway
   - Build the **web** (Next.js → static export) to S3 + invalidate CloudFront

4. After deploy, check `Outputs` in the Actions summary for:
   - Web URL (CloudFront)
   - API base URL
   - Cognito User Pool ID & App client ID

## Repos
- **infra/**: Terraform IaC (Cognito, API Gateway, Lambda, DynamoDB, S3, CloudFront, WAF, Budgets)
- **api/**: OpenAPI 3.0 spec (`huntech-openapi.yaml`)
- **backend/**: Node.js Lambda handlers + lib
- **web/**: Next.js web app with HUNTΞCH theme
- **mobile/**: Expo React Native shell

## Environments
- **dev** only. Staging/prod can be added by duplicating Terraform workspaces and GitHub environments.

## Branding
- Wordmark: **HUNTΞCH**
- Style: Heritage state park — brown base, yellow lettering, **North Star** accent.
- Tagline: *Where Innovation Meets Tradition.*

