#!/bin/bash

# Civic Pulse CloudFront Deployment Script
set -e

# Configuration
STACK_NAME="civic-pulse"
REGION="us-east-1"
PROFILE="default"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Civic Pulse deployment...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Build frontend
echo -e "${YELLOW}📦 Building frontend...${NC}"
cd ../frontend
npm install
npm run build

# Check if build was successful
if [ ! -d "out" ]; then
    echo -e "${RED}❌ Frontend build failed - 'out' directory not found${NC}"
    exit 1
fi

cd ../deploy

# Deploy CloudFormation stack
echo -e "${YELLOW}☁️  Deploying CloudFormation stack...${NC}"
aws cloudformation deploy \
    --template-file cloudformation.yml \
    --stack-name $STACK_NAME \
    --region $REGION \
    --profile $PROFILE \
    --capabilities CAPABILITY_IAM

# Get bucket name from stack outputs
echo -e "${YELLOW}📍 Getting bucket name...${NC}"
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --profile $PROFILE \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
    --output text)

if [ -z "$BUCKET_NAME" ]; then
    echo -e "${RED}❌ Could not get bucket name from CloudFormation stack${NC}"
    exit 1
fi

echo -e "${GREEN}📦 Bucket name: $BUCKET_NAME${NC}"

# Upload frontend files to S3
echo -e "${YELLOW}⬆️  Uploading frontend files to S3...${NC}"
aws s3 sync ../frontend/out s3://$BUCKET_NAME \
    --region $REGION \
    --profile $PROFILE \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --exclude "*.xml" \
    --exclude "*.txt"

# Upload HTML files with shorter cache
aws s3 sync ../frontend/out s3://$BUCKET_NAME \
    --region $REGION \
    --profile $PROFILE \
    --delete \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --include "*.xml" \
    --include "*.txt"

# Get CloudFront distribution ID
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --profile $PROFILE \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
    --output text)

# Get website URL
WEBSITE_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --profile $PROFILE \
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' \
    --output text)

# Invalidate CloudFront cache
echo -e "${YELLOW}🔄 Invalidating CloudFront cache...${NC}"
aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*" \
    --region $REGION \
    --profile $PROFILE

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Website URL: $WEBSITE_URL${NC}"
echo -e "${YELLOW}📝 Note: CloudFront cache invalidation may take 5-15 minutes to complete.${NC}"

# Display useful information
echo -e "\n${YELLOW}📋 Deployment Summary:${NC}"
echo -e "Stack Name: $STACK_NAME"
echo -e "Region: $REGION"
echo -e "S3 Bucket: $BUCKET_NAME"
echo -e "CloudFront Distribution: $DISTRIBUTION_ID"
echo -e "Website URL: $WEBSITE_URL"