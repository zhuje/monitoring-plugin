# Terminal output colors
GREEN='\033[0;32m'
ENDCOLOR='\033[0m' # No Color
RED='\033[0;31m'

# Enviornment Variables  
PREFER_PODMAN="${PREFER_PODMAN:-1}"
PUSH="${PUSH:-1}"
TAG="${TAG:-dev}"

# *** Removing /dist from .dockerignore ***
printf "${GREEN}*** Removing /dist from .dockerignore *** ${ENDCOLOR}\n"

echo "$ cat ../.dockerignore"
cat ../.dockerignore 
echo "\n"

echo "* Removing /dist from .dockerignore" 
sed -i '' '/dist/d' ../.dockerignore
echo "\n"

echo "$ cat ../.dockerignore"
cat ../.dockerignore
echo "\n"

# Warning if ../web/dist doesn't exist 
DIRECTORY=../web/dist
if [ ! -d "$DIRECTORY" ]; then
  echo "$DIRECTORY does not exist."
  echo "Running make install-frontend && make build-frontend` to generate `/node_modules and /dist files"
  cd .. 
  make install-frontend
  make build-frontend
fi

# *** Building Image  *** 
printf "${GREEN}\n*** Building Image  *** ${ENDCOLOR}\n"

read -p "$(printf "${GREEN}What is your quay.io username? (e.g. janesmith): ${ENDCOLOR} ")" REGISTRY_ORG 

if [[ -x "$(command -v podman)" && $PREFER_PODMAN == 1 ]]; then
    OCI_BIN="podman"
else
    OCI_BIN="docker"
fi

BASE_IMAGE="quay.io/${REGISTRY_ORG}/monitoring-plugin"
IMAGE=${BASE_IMAGE}:${TAG}

printf "\n"
printf "${GREEN}Environment Varibles ${ENDCOLOR}\n"
printf "PREFER_PODMAN = ${PREFER_PODMAN}\n"
printf "PUSH = ${PUSH}\n"
printf "TAG = ${TAG}\n"
printf "REGISTRY_ORG = $REGISTRY_ORG\n"
printf "IMAGE = ${IMAGE}\n"
read -p "$(printf "${GREEN} Do these env variables look right? (Y/N): ${ENDCOLOR}")" confirm && [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]] || exit 1

echo "Building image '${IMAGE}' with ${OCI_BIN}"
cd ..
$OCI_BIN build  -f Dockerfile.mac -t $IMAGE  --platform=linux/amd64 . 

# *** Add /dist from .dockerignore back  ***
printf "${GREEN}\n*** Add /dist from .dockerignore back  *** ${ENDCOLOR}\n"

echo "$ cat .dockerignore"
cat .dockerignore 
echo "\n"

if grep -Fxq "/dist" .dockerignore
then
   # if /dist found do nothing
    echo "\n* /dist already exists in .dockerignore" 
else
    # if /dist not found add /dist to end of file 
    echo "\n* Adding /dist from .dockerignore" 
    echo "/dist" >> .dockerignore
fi

echo "$ cat .dockerignore"
cat .dockerignore 
echo "\n"
