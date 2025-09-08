#!/bin/bash

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

# Forward the prometheus service to localhost:9090 
# Then manually, configure the perses_core to point to localhost:9090 as the datasource
echo "Forwarding Prometheus service to localhost:9090..."
oc port-forward -n openshift-monitoring service/prometheus-operated 9090:9090

echo "Testing Prometheus API...curl http://localhost:9090/api/v1/query?query=up"
curl "http://localhost:9090/api/v1/query?query=up"

