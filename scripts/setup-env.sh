#!/bin/bash
#
# Environment Setup Script
# Copies .env.example files to .env.local for local development
#

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "🔧 Setting up environment files..."
echo ""

# Function to copy env file
copy_env() {
  local app=$1
  local example_file="apps/${app}/.env.example"
  local target_file="apps/${app}/.env.local"

  if [ ! -f "$example_file" ]; then
    echo -e "${RED}✗${NC} ${example_file} not found"
    return 1
  fi

  if [ -f "$target_file" ]; then
    echo -e "${YELLOW}⚠${NC}  ${target_file} already exists, skipping..."
    return 0
  fi

  cp "$example_file" "$target_file"
  echo -e "${GREEN}✓${NC} Created ${target_file}"
}

# Copy environment files
copy_env "web"
copy_env "precision"
copy_env "momentum"

echo ""
echo -e "${GREEN}✓${NC} Environment setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env.local files with your credentials:"
echo "      - apps/web/.env.local"
echo "      - apps/precision/.env.local"
echo "      - apps/momentum/.env.local"
echo ""
echo "   2. See docs/ENVIRONMENT.md for detailed setup instructions"
echo ""
echo "   3. Start developing:"
echo "      bun run dev:precision"
echo "      # or"
echo "      bun run dev:momentum"
echo ""
