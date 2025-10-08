#!/bin/bash

# Netlify pre-build script to set up FontAwesome Pro authentication
echo "Setting up FontAwesome Pro authentication..."

# Ensure FONTAWESOME_PACKAGE_TOKEN is available
if [ -z "$FONTAWESOME_PACKAGE_TOKEN" ]; then
  echo "Error: FONTAWESOME_PACKAGE_TOKEN environment variable is not set"
  exit 1
fi

# Create .npmrc with the token
cat > .npmrc << EOF
@awesome.me:registry=https://npm.fontawesome.com/
@fortawesome:registry=https://npm.fontawesome.com/
//npm.fontawesome.com/:_authToken=$FONTAWESOME_PACKAGE_TOKEN
registry=https://registry.npmjs.org/
EOF

echo "FontAwesome Pro authentication configured successfully"