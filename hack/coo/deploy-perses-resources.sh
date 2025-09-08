#!/bin/bash
# Define ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
ENDCOLOR='\033[0m' 

NAMESPACE="openshift-cluster-observability-operator"

# Check if oc command exists
if ! command -v oc &> /dev/null
then
    echo "oc CLI could not be found. Please ensure you are logged into an OpenShift cluster."
    exit 1
fi

# Check if you are logged into a cluster
if ! oc whoami &> /dev/null
then
    echo "Error: You are not logged into an OpenShift cluster. Please run 'oc login' first."
    exit 1
fi

# Prompt use it check env vars before proceeding to build 
read -r -p "$(echo -e "${RED} Have you install the Cluster Observability Operator? [y/N] ${ENDCOLOR}" )" response
if [[ "$response" =~ ^([nN][oO])$ ]]
then
    exit 0
fi

echo -e "Waiting for operator pod to be ready. This may take a few minutes..."
oc get pod -l app.kubernetes.io/name=observability-operator -n ${NAMESPACE}
if [ $? -eq 0 ]; then
    echo -e "✅ ${GREEN} Cluster Observability Operator installed successfully. ${ENDCOLOR}"
else
    echo "❌ ${RED}Failed to install Cluster Observability Operator. Check the logs for more details. ${ENDCOLOR}"
    exit 1
fi

echo "${GREEN} Deploying Datasource: Thanos Querier ${ENDCOLOR}"
NAMESPACE=${NAMESPACE} ./datasource-thanos-querier.sh

echo "${GREEN} Deploying Dashboard: Perses Sample Dashboard ${ENDCOLOR}"
NAMESPACE=${NAMESPACE} ./perses-dashboard.sh
