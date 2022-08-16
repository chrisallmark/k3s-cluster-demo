#!/bin/sh
DOCKER_HUB_USERNAME=$1
if [[ $# -ne 1 ]]; then
  echo "Usage: configure <docker hub username>"
  exit 1
fi
sed -i '' "s/DOCKER_HUB_USERNAME/${DOCKER_HUB_USERNAME}/g" infra/*.yaml