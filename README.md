# monitoring-plugin

This plugin adds the monitoring UI to the OpenShift web console.

## Docker image

Before you can deploy the plugin on a cluster, you must build an image and push it to an image registry.

1. Build the image:

   ```sh
   docker build -t quay.io/my-repositroy/my-plugin:latest .
   ```

2. Run the image:

   ```sh
   docker run -it --rm -d -p 9001:80 quay.io/my-repository/my-plugin:latest
   ```

3. Push the image:

   ```sh
   docker push quay.io/my-repository/my-plugin:latest
   ```

NOTE: If you have a Mac with Apple silicon, you will need to add the flag `--platform=linux/amd64` when building the image to target the correct platform to run in-cluster.

## Deployment on cluster

A [Helm](https://helm.sh) chart is available to deploy the plugin to an OpenShift environment.

The following Helm parameters are required:

`plugin.image`: The location of the image containing the plugin that was previously pushed

Additional parameters can be specified if desired. Consult the chart [values](charts/openshift-console-plugin/values.yaml) file for the full set of supported parameters.

### Installing the Helm Chart

Install the chart into a new namespace or an existing namespace as specified by the `my-plugin-namespace` parameter and providing the location of the image within the `plugin.image` parameter by using the following command:

```shell
helm upgrade -i monitoring-plugin charts/openshift-console-plugin -n my-plugin-namespace --create-namespace --set plugin.image=my-plugin-image-location
```

## Local Development 

### Dependencies 
1. [yarn](https://yarnpkg.com/en/docs/install)
2. [oc](https://mirror.openshift.com/pub/openshift-v4/clients/oc/4.4/) 
3. [podman 3.2.0+](https://podman.io) or [Docker](https://www.docker.com) 
4. An OpenShift cluster

### Running Locally 
```
# Login to an OpenShift cluster 
$ oc login <clusterAddress> -u <username> -p <password>

# Start podman (or Docker) 
$ podman machine init 
$ podman machine start 

# Install Dependencies
$ yarn install 
# Run the application 
$ yarn start
# In a seperate terminal 
$ yarn start-console
```
The application will be running at [localhost:9000](http://localhost:9000/).

### Local Development Troubleshooting 
1. Disable cache. Select 'disable cache' in your browser's DevTools > Network > 'disable cache'. Or use private/incognito mode in your browser.

