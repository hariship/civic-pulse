# CloudFront Deployment Guide

This guide will help you deploy Civic Pulse to AWS CloudFront + S3.

## Prerequisites

1. **AWS CLI installed and configured**
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, Region (us-east-1), and output format (json)
   ```

2. **Node.js and npm installed**

3. **Permissions**: Your AWS user needs permissions for:
   - CloudFormation
   - S3
   - CloudFront
   - IAM (for creating roles)

## Quick Deployment

### Single Command Deployment
```bash
npm run deploy
```

This will:
1. Build the frontend for production
2. Create AWS infrastructure (S3 + CloudFront)
3. Upload frontend files to S3
4. Invalidate CloudFront cache
5. Provide you with the website URL

## Manual Deployment Steps

### 1. Build Frontend
```bash
cd frontend
npm install
npm run build
```

### 2. Deploy Infrastructure
```bash
cd ../deploy
aws cloudformation deploy \
    --template-file cloudformation.yml \
    --stack-name civic-pulse \
    --region us-east-1 \
    --capabilities CAPABILITY_IAM
```

### 3. Upload Files to S3
```bash
# Get bucket name
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name civic-pulse \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
    --output text)

# Upload files
aws s3 sync ../frontend/out s3://$BUCKET_NAME --delete
```

### 4. Invalidate CloudFront Cache
```bash
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name civic-pulse \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
    --output text)

aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*"
```

## Backend Deployment

The frontend is configured to work with any backend API. You have several options:

### Option 1: AWS Lambda + API Gateway
- Deploy backend using AWS Lambda
- Update `NEXT_PUBLIC_API_URL` environment variable
- Update CloudFormation template with your API Gateway URL

### Option 2: EC2 Instance
- Deploy backend to EC2
- Configure security groups for port 8000
- Update API URL in frontend

### Option 3: ECS/Fargate
- Containerize backend
- Deploy to ECS
- Use Application Load Balancer

## Environment Variables

Update these in your deployment:

```bash
# Frontend environment variables
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## Custom Domain (Optional)

To use a custom domain:

1. **Get SSL Certificate**
   ```bash
   aws acm request-certificate \
       --domain-name yourdomain.com \
       --validation-method DNS
   ```

2. **Update CloudFormation Template**
   - Add `AcmCertificateArn` parameter
   - Add `Aliases` to CloudFront distribution

3. **Update DNS**
   - Point your domain to CloudFront distribution

## Useful Commands

```bash
# Deploy full stack
npm run deploy

# Deploy only frontend changes
npm run deploy:frontend

# Get website URL
aws cloudformation describe-stacks \
    --stack-name civic-pulse \
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' \
    --output text

# Delete stack (cleanup)
aws cloudformation delete-stack --stack-name civic-pulse
```

## Troubleshooting

### Build Fails
- Check Node.js version (requires 18+)
- Clear cache: `rm -rf frontend/.next frontend/node_modules`
- Reinstall: `cd frontend && npm install`

### Upload Fails
- Check AWS credentials: `aws sts get-caller-identity`
- Verify bucket exists: `aws s3 ls`
- Check permissions

### CloudFront Not Updating
- Cache invalidation takes 5-15 minutes
- Check invalidation status in AWS Console
- Use versioned filenames for immediate updates

## Cost Estimation

- **S3**: ~$0.023/GB/month storage + $0.0004/1000 requests
- **CloudFront**: ~$0.085/GB data transfer + $0.0075/10,000 requests
- **Typical small site**: $1-5/month

## Security

- S3 bucket is private, accessed only through CloudFront
- HTTPS enforced on all connections
- Origin Access Control prevents direct S3 access
- Consider adding WAF for additional protection