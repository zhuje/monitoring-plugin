# Development Notes

## Testing on Cluster 
This needs to be on a AWS cluster NOT ROSA. Because we need to change the Monitroing Console Operator > monitoring console image. 
 
We need to update the monitoring-plugin with our image and need to make sure the the monitoring-console-plugin deploys the changes for incidents. 



## Incidents: Build Image, Enable Incidents, and Deploy changes on the cluster 

REGISTRY_ORG="jezhu" TAG="ou594-incidents-0.0.3" make build-mcp-image

podman push quay.io/jezhu/monitoring-plugin:ou594-incidents-0.0.3

helm template charts/openshift-console-plugin --set plugin.image=quay.io/jezhu/monitoring-plugin:ou594-incidents-0.0.1 --set plugin.features.incidents.enabled=true

### Incidents Notes 
This chunk of code in build-image.sh is to accomdate MAC/podman not eing able to build applications in the cluster. 
So just be careful stopping the build-image in the middle since those changes are made to your local files.

```
# build-image.sh

# update plugin name outside of the docker image build
if [[ "$OSTYPE" == "darwin"* ]] && [[ "$DOCKER_FILE_NAME" == "Dockerfile.mcp" ]]; then
    printf "${YELLOW}Updateing plugin-name ${ENDCOLOR}\n"
    make update-plugin-name
    export I18N_NAMESPACE='plugin__monitoring-console-plugin'

    printf "${YELLOW}Building Frontend${ENDCOLOR}\n"
    make build-frontend
fi

# Rollback local changes made
if [[ "$OSTYPE" == "darwin"* ]] && [[ "$DOCKER_FILE_NAME" == "Dockerfile.mcp" ]]; then
    printf "${YELLOW}Replacing in package.json and values.yaml${ENDCOLOR}\n"
    sed -i 's/"name": "monitoring-console-plugin",/"name": "monitoring-plugin",/g' web/package.json
    printf "${YELLOW}Renaming translations to the original plugin name${ENDCOLOR}\n"
    cd web/locales/ && for dir in *; do if cd $dir; then  for filename in *; do mv plugin__monitoring-console-plugin.json plugin__monitoring-plugin.json; done; cd ..; fi; done
fi

```


# Testing on a Cluster 
