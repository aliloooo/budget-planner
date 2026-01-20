#!/bin/bash

# Budget Planner - Heroku Deployment Script
# This script automates the deployment process to Heroku

set -e  # Exit on error

echo "🚀 Budget Planner - Heroku Deployment Script"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}❌ Heroku CLI not found!${NC}"
    echo "Please install Heroku CLI first:"
    echo "  macOS: brew tap heroku/brew && brew install heroku"
    echo "  Or visit: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

echo -e "${GREEN}✅ Heroku CLI detected${NC}"
echo ""

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Heroku${NC}"
    echo "Please login first:"
    heroku login
fi

echo -e "${GREEN}✅ Logged in to Heroku${NC}"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${YELLOW}⚠️  Git not initialized${NC}"
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - Budget Planner"
    echo -e "${GREEN}✅ Git initialized${NC}"
fi

echo ""
echo "📝 Deployment Options:"
echo "1. Create new Heroku app"
echo "2. Deploy to existing app"
echo ""
read -p "Choose option (1 or 2): " option

if [ "$option" == "1" ]; then
    echo ""
    read -p "Enter app name (leave empty for random name): " app_name
    
    if [ -z "$app_name" ]; then
        heroku create
    else
        heroku create "$app_name"
    fi
    
    echo -e "${GREEN}✅ Heroku app created${NC}"
elif [ "$option" == "2" ]; then
    echo ""
    read -p "Enter existing app name: " app_name
    
    if [ -z "$app_name" ]; then
        echo -e "${RED}❌ App name cannot be empty${NC}"
        exit 1
    fi
    
    # Add git remote if not exists
    if ! git remote | grep -q heroku; then
        heroku git:remote -a "$app_name"
    fi
    
    echo -e "${GREEN}✅ Connected to existing app: $app_name${NC}"
else
    echo -e "${RED}❌ Invalid option${NC}"
    exit 1
fi

echo ""
echo "🔧 Setting buildpack..."
heroku buildpacks:set heroku/nodejs
echo -e "${GREEN}✅ Buildpack configured${NC}"

echo ""
echo "🔐 Configuring environment variables..."
echo ""
echo "Enter your Supabase credentials:"
read -p "VITE_SUPABASE_URL: " supabase_url
read -p "VITE_SUPABASE_ANON_KEY: " supabase_key

if [ -z "$supabase_url" ] || [ -z "$supabase_key" ]; then
    echo -e "${RED}❌ Environment variables cannot be empty${NC}"
    exit 1
fi

heroku config:set VITE_SUPABASE_URL="$supabase_url"
heroku config:set VITE_SUPABASE_ANON_KEY="$supabase_key"

echo -e "${GREEN}✅ Environment variables configured${NC}"

echo ""
echo "📦 Testing build locally..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Please fix build errors before deploying"
    exit 1
fi

echo ""
read -p "Ready to deploy? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "🚀 Deploying to Heroku..."

# Commit any changes
git add .
git commit -m "Deploy to Heroku" || true

# Push to Heroku
git push heroku main || git push heroku master

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📊 View logs:"
echo "  heroku logs --tail"
echo ""
echo "🌐 Open app:"
echo "  heroku open"
echo ""
echo "⚙️  View config:"
echo "  heroku config"
echo ""
