#!/bin/bash

echo "=========================================="
echo "GitHub Push Helper for AI Health Assistant"
echo "=========================================="
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI not found. We'll use standard git commands."
    echo ""
fi

# Get user input
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter repository name (e.g., ai-health-assistant): " REPO_NAME

echo ""
echo "📋 Summary:"
echo "  Username: $GITHUB_USERNAME"
echo "  Repo: $REPO_NAME"
echo "  URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""

read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Aborted."
    exit 1
fi

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    git branch -M main
fi

# Add remote
echo "🔗 Setting up remote..."
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Stage files
echo "📦 Staging files..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "Initial commit: AI-Powered Health Assistant

Features:
- AI Health Chat with GPT-5.2
- Symptom Checker
- Health Metrics Tracking with charts
- Smart Reminders
- Secure Authentication
- Responsive Design

Tech: React + FastAPI + MongoDB"

# Push
echo "🚀 Pushing to GitHub..."
echo ""
echo "⚠️  You will need to authenticate with GitHub"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 View your repository at: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "Next steps:"
    echo "  1. Go to your GitHub repository"
    echo "  2. Update the .env files with your credentials"
    echo "  3. Deploy to your preferred platform"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "  1. Repository doesn't exist - Create it on GitHub first: https://github.com/new"
    echo "  2. Authentication failed - You may need to use a Personal Access Token"
    echo "  3. Branch conflicts - Try: git push -f origin main"
    echo ""
    echo "Manual push command:"
    echo "  git push -u origin main"
fi
