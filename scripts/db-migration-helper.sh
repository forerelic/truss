#!/bin/bash

#######################################
# Migration Helper Script
#######################################
# This script helps developers create migrations and keep types in sync.
#
# Usage:
#   ./scripts/db-migration-helper.sh <migration_name>
#   bun run db:migration:create <migration_name>
#
# Example:
#   bun run db:migration:create add_users_table
#######################################

set -e # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if migration name provided
if [ -z "$1" ]; then
  echo -e "${RED}❌ Error: Migration name required${NC}"
  echo ""
  echo "Usage: bun run db:migration:create <migration_name>"
  echo ""
  echo "Example:"
  echo "  bun run db:migration:create add_users_table"
  exit 1
fi

MIGRATION_NAME=$1

echo -e "${BLUE}🚀 Creating new migration: ${MIGRATION_NAME}${NC}"
echo ""

# Step 1: Create migration file
echo -e "${YELLOW}📝 Step 1/4: Creating migration file...${NC}"
bunx supabase migration new "$MIGRATION_NAME"

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to create migration file${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Migration file created${NC}"
echo ""

# Find the newly created migration file
MIGRATION_FILE=$(ls -t supabase/migrations/*.sql | head -1)
echo -e "${BLUE}📄 Migration file: ${MIGRATION_FILE}${NC}"
echo ""

# Step 2: Prompt user to edit the file
echo -e "${YELLOW}📝 Step 2/4: Edit your migration file${NC}"
echo ""
echo "The migration file is now open. Please:"
echo "  1. Add your SQL changes"
echo "  2. Save and close the file"
echo ""
echo -e "${BLUE}Press Enter when you're done editing...${NC}"

# Open in default editor or prompt
if [ -n "$EDITOR" ]; then
  $EDITOR "$MIGRATION_FILE"
else
  # Try common editors
  if command -v code >/dev/null 2>&1; then
    code --wait "$MIGRATION_FILE"
  elif command -v vim >/dev/null 2>&1; then
    vim "$MIGRATION_FILE"
  elif command -v nano >/dev/null 2>&1; then
    nano "$MIGRATION_FILE"
  else
    echo -e "${YELLOW}⚠️  No editor found. Please edit manually:${NC}"
    echo "   $MIGRATION_FILE"
    read -p "Press Enter when done..."
  fi
fi

echo ""
echo -e "${GREEN}✅ Migration edited${NC}"
echo ""

# Step 3: Apply migration locally
echo -e "${YELLOW}📝 Step 3/4: Applying migration locally...${NC}"

# Check if Supabase is running
if ! bunx supabase status >/dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Local Supabase not running. Starting...${NC}"
  bunx supabase start
fi

# Reset local database with new migration
bunx supabase db reset --local

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to apply migration${NC}"
  echo ""
  echo "Please fix the migration file and try again:"
  echo "  $MIGRATION_FILE"
  exit 1
fi

echo -e "${GREEN}✅ Migration applied locally${NC}"
echo ""

# Step 4: Generate TypeScript types
echo -e "${YELLOW}📝 Step 4/4: Generating TypeScript types...${NC}"

bun run db:generate --local

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to generate types${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Types generated${NC}"
echo ""

# Success summary
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Migration Created Successfully!   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo ""
echo "  1. Review your changes:"
echo -e "     ${YELLOW}git diff${NC}"
echo ""
echo "  2. Test your migration:"
echo -e "     ${YELLOW}bun run db:reset${NC}"
echo ""
echo "  3. Commit both migration and types:"
echo -e "     ${YELLOW}git add supabase/migrations/${MIGRATION_NAME}.sql packages/ui/src/lib/supabase/types.ts${NC}"
echo -e "     ${YELLOW}git commit -m \"feat: ${MIGRATION_NAME}\"${NC}"
echo ""
echo "  4. Push and create PR:"
echo -e "     ${YELLOW}git push origin \$(git branch --show-current)${NC}"
echo ""
echo -e "${GREEN}🎉 Happy migrating!${NC}"
