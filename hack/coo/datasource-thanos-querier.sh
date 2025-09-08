#!/bin/bash

# This script assumes the 'NAMESPACE' environment variable is already set.

# Check if the oc command-line tool is available
if ! command -v oc &> /dev/null
then
    echo "Error: 'oc' command not found. Please ensure you are logged into an OpenShift cluster."
    exit 1
fi

# Check if the NAMESPACE environment variable is set and not empty
if [ -z "$NAMESPACE" ]; then
    echo "Error: 'NAMESPACE' environment variable is not set. Please set it before running this script."
    exit 1
fi

echo "Applying PersesDatasource to namespace: $NAMESPACE"

# Use a heredoc to define the YAML content and pipe it to 'oc apply'
# The 'envsubst' command replaces the ${NAMESPACE} variable with the
# value from the shell environment before applying the YAML.
envsubst <<EOF | oc apply -f -
apiVersion: perses.dev/v1alpha1
kind: PersesDatasource
metadata:
  name: thanos-querier-datasource
  namespace: ${NAMESPACE}
spec:
  config:
    display:
      name: "Thanos Querier Datasource"
    default: true
    plugin:
      kind: "PrometheusDatasource"
      spec:
        proxy:
          kind: HTTPProxy
          spec:
            url: https://thanos-querier.openshift-monitoring.svc.cluster.local:9091
            secret: thanos-querier-datasource-secret
  client:
    tls:
      enable: true
      caCert:
        type: file
        certPath: /ca/service-ca.crt
EOF

# Check the exit status of the previous command
if [ $? -eq 0 ]; then
    echo "✅ Successfully applied thanos-querier-datasource in namespace '$NAMESPACE'."
else
    echo "❌ Failed to apply thanos-querier-datasource. Check the output above for errors."
    exit 1
fi