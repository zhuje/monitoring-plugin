# OpenShift Monitoring Plugin

This plugin runs in one of two modes, with and without feature flags. When deployed without any feature flags enabled, it will add the monitoring UI to the OpenShift web console. This is most commonly seen in the [CMO](https://github.com/openshift/cluster-monitoring-operator) deployment of it, which is shipped by default with every OpenShift cluster. Documentation for this mode is located under the [monitoring-plugin](#monitoring-plugin) heading.

When started with feature flag(s), it will instead only add functionality to the OpenShift web console related to the features. Documentation for this mode is located under the [monitoring-console-plugin](#monitoring-console-plugin) heading.

## monitoring-plugin

This section describes knowledge helpful to development of the default monitoring-plugin.

### Docker image

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

### Deployment on cluster

A [Helm](https://helm.sh) chart is available to deploy the plugin to an OpenShift environment.

The following Helm parameters are required:

`plugin.image`: The location of the image containing the plugin that was previously pushed

Additional parameters can be specified if desired. Consult the chart [values](charts/openshift-console-plugin/values.yaml) file for the full set of supported parameters.

#### Installing the Helm Chart

Install the chart into a new namespace or an existing namespace as specified by the `my-plugin-namespace` parameter and providing the location of the image within the `plugin.image` parameter by using the following command:

```shell
helm upgrade -i monitoring-plugin charts/openshift-console-plugin -n my-plugin-namespace --create-namespace --set plugin.image=my-plugin-image-location
```

### Redux Store

The monitoring-plugin is currently in a transitionary state as the remaining pages are moved from the [openshift/console](https://github.com/openshift/console) repo to this one. One such instance of this is the redux store [definition](https://github.com/openshift/console/blob/master/frontend/public/reducers/observe.ts), which lives within the `openshift/console` codebase.

Changes to the store must be completed in the `openshift/console` codebase and are not backwards compatible unless cherry-picked with purpose.

### Local Development

#### Dependencies

1. [Node.js 22+](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) are required
2. [oc](https://mirror.openshift.com/pub/openshift-v4/clients/oc/4.4/)
3. [podman 3.2.0+](https://podman.io) or [Docker](https://www.docker.com)
4. An OpenShift cluster

#### Running Locally

```
# Login to an OpenShift cluster
$ oc login <clusterAddress> -u <username> -p <password>

# Start podman (or Docker)
$ podman machine init
$ podman machine start

# Install dependencies
$ make install

# Run the application
$ make start-frontend
# In a separate terminal
$ make start-console
```

The application will be running at [localhost:9000](http://localhost:9000/).

#### Local Development Troubleshooting

1. Disable cache. Select 'disable cache' in your browser's DevTools > Network > 'disable cache'. Or use private/incognito mode in your browser.
2. Enable higher log verbosity by setting `-log-level=trace` when starting the plugin backend. For more options to set log level see [logrus documentation](https://github.com/sirupsen/logrus?tab=readme-ov-file#level-logging).

## monitoring-console-plugin (mcp)

### Dependencies
1. [Local Development Dependencies](README#Dependencies)
2. [yq](https://github.com/mikefarah/yq) for acm deployment
3. sed ([gnu-sed](https://formulae.brew.sh/formula/gnu-sed) for mac, with sed being aliased to that gnu-sed)


### Building an image
Images for the mcp can be built by running the following command. Due to the limitation of linux/amd64 image builds on Apple Silicon Macs's, some of the changes are run locally and not just in the Dockerfiles. If you are on a Mac, it is not suggested to cancel the exection of this scipt part way through

```bash
make build-dev-mcp-image
```

### Feature Flags

Feature flags are used by the mcp mode to dictate the specific features which are enabled when the server starts up. Feature flags should be added to the Feature enum [here](pkg/server.go) and to the useFeature hook [here](web/src/components/hooks/useFeatures.ts). When any feature flag is enabled the default extension points are overridden, including a new monitoring-console-plugin exclusive redux store and all extension points for the flags. These feature extension points are created through the use of [json-patches](https://datatracker.ietf.org/doc/html/rfc6902), such as the `acm-alerting` patch [here](config/acm-alerting.patch.json). The server looks for a patch in the format of `{feature-flag-name}.patch.json` to apply.

| Feature           | OCP Version |
|-------------------|-------------|
| acm-alerting      | 4.14+       |
| perses-dashboards | 4.14+       |
| incidents         | 4.17+       |
| dev-config        |             |

#### ACM

Due to the extensive number of items which would need to be run to locally run the ACM perspective, the suggested development pattern is instead repeat installations with helm. A small number of scripts have been put together to help you deploy the monitoring-plugin in its `acm-alerting` configuration. REGISTRY_ORG and TAG variables are available to adjust the quay image generated and used for deployment. Certain build time changes to the codebase are created when running these scripts.

```bash
make deploy-acm
```

Once the code has been updated, make sure to update the helm chart and variables ([variable example](https://github.com/openshift/monitoring-plugin/blob/main/charts/openshift-console-plugin/values.yaml#L32), [chart example](https://github.com/openshift/monitoring-plugin/blob/main/charts/openshift-console-plugin/templates/deployment.yaml#L49)) for ease of deployment of your feature.

### Redux Store

Since the store for the `monitoring-plugin` is stored in the `openshift/console` codebase and updates to the store that are aren't tied directly to the OCP are needed, when the default extension points are removed due to the presence of a feature flag a duplicate store is created at the `.state.plugins.mcp` path. A combination of the `useFeatures` hook and the `getLegacyObserveState` (which is dependent on the perspective) can be used to retrieve the state from the redux store based on the mode the plugin was deployed in.

### Local Development

```
# Login to an OpenShift cluster
$ oc login <clusterAddress> -u <username> -p <password>

# Start podman (or Docker) - Linux machines can skip this part 
$ podman machine init
$ podman machine start

# Install dependencies
$ make install

# Run the application
$ make start-frontend

# In a separate terminal
$ make start-feature-console

# In a separate terminal
$ make start-feature-backend
```

`make start-feature-backend` will inject the `perses-dashboards`, `incidents`, and `dev-config` features by default. Features such as `acm-alerting` which take in extra parameters will need to run the `make start-feature-backend` command with the appropriate environment variables, such as `MONITORING_PLUGIN_ALERTMANAGER`.

#### Local Development with Perses Proxy 
The bridge script `start-console.sh` is configured to proxy to a local Perses instance running at port `:8080`. To run the local Perses instance you will need to clone the [perses/perses](https://github.com/perses/perses) repository and follow the start up instructions in [README.md](https://github.com/perses/perses?tab=readme-ov-file#building-from-source) :

##### Building From Source 
```
# Clone the perses/perses repo 
$ git clone https://github.com/perses/perses.git
$ cd perses

# Build from source 
$ make build

# Lastly navigate to http://localhost:8080/ to see Perses app running
```
You can edit/create dashboards in the Perses UI at `http://localhost:8080/`  and view the changes after reloading monitoring-plugin pages in `http://localhost:9000/`.

##### [Optional Configuration] Connecting Perses to Promethues Instance via OpenShift
To use the OpenShift instance of Prometheus follow these instructions:

```
# Login to an OpenShift cluster
$ oc login <clusterAddress> -u <username> -p <password>

# Port forward Prometheus Operated to localhost at port 9090
$ oc port-forward -n openshift-monitoring service/prometheus-operated 9090:9090

# Test the connection to the Promtheus API
$ curl "http://localhost:9090/api/v1/query?query=up"     
```

Then you must update datasource configurations to point to `http://localhost:9090`, see instructions [here](#datasource-configuration).

##### [Optional Configuration] Connecting Perses to Promethues Instance via Docker Image 

Navigate to the root of perses/perses and run the [docker-comspose.yaml](https://github.com/perses/perses/blob/main/dev/docker-compose.yaml
) file. 

```
docker-compose --file dev/docker-compose.yaml --profile prometheus --profile tempo up --detach
```

Then you must update datasource configurations to point to `http://localhost:9090`, see instructions [here](#datasource-configuration).

##### Datasource Configuration
By default Perses is setup to use as the global datasource for Prometheus `demo.prometheus.io` ([github](https://github.com/prometheus/demo-site)).

You can update Perses datasource configuration to point to `http://localhost:9090` after port-forwarding a Promethus instance, see `Connecting Perses to Promethues Instance via OpenShift` or `Connecting Perses to Promethues Instance via Docker Image`.

Then, in Perses UI change the Perses > Admin > Global Datasource > select `prometehuslocal` > Edit > `Set as default`. This will allow the proxy to `http://localhost:9090` to used as the default datasource. 

Additional you may need to set a Project datasource configuration proxy to `http://localhost:9090` as your Datasource within your Project. Select your project > `Datasources` tab > `Add Datasource` > Create Datasource Form. In this form enter the following (replace `ABITRARY_DATASOURCE_NAME` with whatever you like to label the datasource):
- Name: `ABITRARY_DATASOURCE_NAME`
- Source : `Prometheus Datasource` 
- HTTP Settings: `Proxy`
- URL: `http://localhost:9090`

Then click `Save`. 