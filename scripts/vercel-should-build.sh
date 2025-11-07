#!/bin/bash

# This script determines if Vercel should build based on what files changed
# Exit 0 = Build, Exit 1 = Skip build

# Get the list of changed files
if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  # No previous commit (first deploy), always build
  echo "First deploy - building"
  exit 0
fi

# Get changed files between commits
CHANGED_FILES=$(git diff --name-only $VERCEL_GIT_PREVIOUS_SHA $VERCEL_GIT_COMMIT_SHA)

# Check if any changed files are outside generation-working/
# or if generation-working doesn't contain all changes
echo "Changed files:"
echo "$CHANGED_FILES"

# Filter out generation-working changes
NON_DOC_CHANGES=$(echo "$CHANGED_FILES" | grep -v "^generation-working/" | grep -v "^$")

if [ -z "$NON_DOC_CHANGES" ]; then
  echo "Only documentation changes in generation-working/ - skipping build"
  exit 1
else
  echo "Code changes detected - building"
  exit 0
fi
