#!/bin/bash

# Script to download historical basemaps GeoJSON data and convert to TopoJSON
# Usage: ./get-basemaps.sh

set -e

REPO_URL="https://github.com/aourednik/historical-basemaps"
GEOJSON_DIR="tmp/geojson"
TOPO_DIR="src/data/topo-data"

echo "Downloading historical basemaps..."

# Create temporary directory
mkdir -p "$GEOJSON_DIR"

# Download the GeoJSON files from the repository
# Using GitHub's API to get the file list, then downloading each file
GITHUB_API_URL="https://api.github.com/repos/aourednik/historical-basemaps/contents/geojson"

# Get list of files and download each one
curl -s "$GITHUB_API_URL" | \
  grep -o '"download_url": "[^"]*"' | \
  sed 's/"download_url": "\([^"]*\)"/\1/' | \
  while read -r file_url; do
    filename=$(basename "$file_url")
    curl -s -o "$GEOJSON_DIR/$filename" "$file_url"
  done

echo "Download complete, counting files..."
file_count=$(ls -1 "$GEOJSON_DIR"/*.geojson 2>/dev/null | wc -l | tr -d ' ')
echo "Downloaded $file_count GeoJSON files"

echo ""
echo "Converting to TopoJSON..."

# Convert GeoJSON to TopoJSON
./convert-to-topojson.sh "$GEOJSON_DIR" "$TOPO_DIR"

# Clean up temporary directory
rm -rf tmp

echo ""
echo "Done! TopoJSON files are in $TOPO_DIR"
