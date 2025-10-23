#!/bin/bash

# Verify no test files are in production build

echo "🔍 Checking for test files in dist..."

TEST_FILES=$(find dist -type f \( -name "*test*" -o -name "*spec*" -o -name "*vitest*" \) 2>/dev/null)

if [ -n "$TEST_FILES" ]; then
  echo "❌ ERROR: Test files found in production build:"
  echo "$TEST_FILES"
  exit 1
else
  echo "✅ No test files found in dist/"
fi

echo ""
echo "📦 Production bundle size:"
du -sh dist/
echo ""
echo "📊 Asset breakdown:"
ls -lh dist/assets/

exit 0
