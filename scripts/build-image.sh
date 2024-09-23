#!/usr/bin/env bash

set -euo pipefail

PREFER_PODMAN="${PREFER_PODMAN:-1}"
PUSH="${PUSH:-1}"
TAG="${TAG:-dev-4}"
REGISTRY_ORG="${REGISTRY_ORG:-jezhu}"

if [[ -x "$(command -v podman)" && $PREFER_PODMAN == 1 ]]; then
    OCI_BIN="podman"
else
    OCI_BIN="docker"
fi

BASE_IMAGE="quay.io/${REGISTRY_ORG}/monitoring-plugin"
IMAGE=${BASE_IMAGE}:${TAG}

echo "Building image '${IMAGE}' with ${OCI_BIN}"
$OCI_BIN build -f Dockerfile.local -t $IMAGE --platform=linux/amd64 .

if [[ $PUSH == 1 ]]; then
    $OCI_BIN push $IMAGE
fi
