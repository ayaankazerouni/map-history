#!/bin/bash

# Script to convert GeoJSON files to TopoJSON using geo2topo
# Usage: ./convert-to-topojson.sh <input_dir> <output_dir>

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <input_directory> <output_directory>"
    echo "Example: $0 ./geojson ./topojson"
    exit 1
fi

INPUT_DIR="$1"
OUTPUT_DIR="$2"

# Check if input directory exists
if [ ! -d "$INPUT_DIR" ]; then
    echo "Error: Input directory '$INPUT_DIR' does not exist"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Check if geo2topo is available
if ! command -v geo2topo &> /dev/null; then
    echo "Error: geo2topo command not found"
    echo "Install it with: npm install -g topojson-server"
    exit 1
fi

# Counter for progress
count=0
total=$(find "$INPUT_DIR" -name "*.geojson" -type f | wc -l | tr -d ' ')

echo "Found $total GeoJSON files to convert"
echo "Converting files from '$INPUT_DIR' to '$OUTPUT_DIR'..."

# Calculate initial size
initial_size=$(find "$INPUT_DIR" -name "*.geojson" -type f -exec du -ch {} + | grep total | awk '{print $1}')
initial_bytes=$(find "$INPUT_DIR" -name "*.geojson" -type f -exec stat -f%z {} + | awk '{s+=$1} END {print s}')

# Convert each GeoJSON file to TopoJSON
find "$INPUT_DIR" -name "*.geojson" -type f | while read -r geojson_file; do
    # Get the base filename without extension
    basename=$(basename "$geojson_file" .geojson)

    # Output file path with .json extension
    output_file="$OUTPUT_DIR/${basename}.json"

    # Convert using geo2topo with named object "regions"
    geo2topo regions="$geojson_file" > "$output_file"

    count=$((count + 1))
    echo "[$count/$total] Converted: $basename.geojson -> $basename.json"
done

# Calculate final size
final_size=$(find "$OUTPUT_DIR" -name "*.json" -type f -exec du -ch {} + | grep total | awk '{print $1}')
final_bytes=$(find "$OUTPUT_DIR" -name "*.json" -type f -exec stat -f%z {} + | awk '{s+=$1} END {print s}')

# Calculate reduction
reduction_bytes=$((initial_bytes - final_bytes))
reduction_percent=$(awk "BEGIN {printf \"%.1f\", ($reduction_bytes / $initial_bytes) * 100}")

echo ""
echo "Was $initial_size ($initial_bytes bytes), now $final_size ($final_bytes bytes)"
