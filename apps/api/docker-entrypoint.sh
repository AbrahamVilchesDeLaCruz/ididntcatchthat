#!/bin/sh
set -e

echo "Running migrations..."
node node_modules/.bin/typeorm migration:run -d dist/src/shared/infrastructure/persistence/typeorm/typeorm.config.cli.js

echo "Starting app..."
exec node dist/src/main
