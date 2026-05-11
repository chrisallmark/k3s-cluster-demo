#!/bin/sh
DOCKER_HUB_USERNAME=$1
if [ $# -ne 1 ]; then
  echo "Usage: configure <docker hub username>"
  exit 1
fi
find ./ -name '*.yaml' | while read -r file; do
  if [ "$(uname)" = "Darwin" ]; then
    sed -i '' "s/DOCKER_HUB_USERNAME/${DOCKER_HUB_USERNAME}/g" "$file"
  else
    sed -i "s/DOCKER_HUB_USERNAME/${DOCKER_HUB_USERNAME}/g" "$file"
  fi
done
