#!/usr/bin/env bash

set -euo pipefail

PREFER_PODMAN="${PREFER_PODMAN:-1}"
PUSH="${PUSH:-0}"
TAG="${TAG:-v1.0.0}"
REGISTRY_ORG="${REGISTRY_ORG:-openshift-observability-ui}"

# comment out web/dist if not already commented out 
if grep -q "#web/dist" ".dockerignore"; then
  echo '#web/dist was found'
else 
  echo '#web/dist was NOT found. Commenting out web/dist'

  sed -i '' -e 's|web/dist|s/^#|g'

#   sed -i '' -e '/web/dist/s/^#' .dockerignore
  echo 'cat .dockerignore' 
  cat .dockerignore
fi


# remove web/dist and make build-frontend 


# if [[ -x "$(command -v podman)" && $PREFER_PODMAN == 1 ]]; then
#     OCI_BIN="podman"
# else
#     OCI_BIN="docker"
# fi

# BASE_IMAGE="quay.io/${REGISTRY_ORG}/monitoring-plugin"
# IMAGE=${BASE_IMAGE}:${TAG}

# echo "Building image '${IMAGE}' with ${OCI_BIN}"
# $OCI_BIN build -f Dockerfile.mac -t $IMAGE --platform=linux/amd64 .

# if [[ $PUSH == 1 ]]; then
#     $OCI_BIN push $IMAGE
# fi

# undo comment out of web/dist 