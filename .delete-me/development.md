# Development Notes

## Build Image, Enable Incidents, and Deploy changes on the cluster 

REGISTRY_ORG="jezhu" TAG="ou594-incidents-0.0.1" make build-mcp-image

podman push quay.io/jezhu/monitoring-plugin:ou594-incidents-0.0.1

helm template charts/openshift-console-plugin --set plugin.image=quay.io/jezhu/monitoring-plugin:ou594-incidents-0.0.1 --set plugin.features.incidents.enabled=true