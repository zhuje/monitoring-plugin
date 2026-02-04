# Prerequiste: oc login to cluster & 
# git clone https://github.com/observability-ui/development-tools & 
# git clone https://github.com/etmurasaki/dotfiles/

# ** For COO use "namespace: openshift-cluster-observability-operator" OR for OBO use "namespace: observability-operator"

# Local path references 
DEV_TOOLS_PATH="/Users/jezhu/Git/development-tools/perses/rbac"
DOTFILE_PATH="/Users/jezhu/Git/etmuraski-dotfiles/dotfiles/scripts/rbac/dashboards" 

# Create users 
cd ~$DEV_TOOLS_PATH
./replace-htpssd-test-user.sh

# Add role binding to users 
cd ~$DEV_TOOLS_PATH/coo140
./rbac_perses_e2e_user1_user2.sh
oc apply -f /Users/jezhu/Git/monitoring-plugin/configmaps-reader-role.yaml
oc auth can-i get configmaps --namespace=openshift-config-managed --as=user1


# Install PersesDashboards 
cd ~$DOTFILE_PATH
oc apply -f perses-dashboard-sample.yaml 
oc apply -f prometheus-overview-variables.yaml 
oc apply -f openshift-cluster-sample-dashboard.yaml # **

# Install PersesDatasources
oc apply -f perses-datasource-sample.yaml 
oc apply -f thanos-querier-datasource.yaml # ** 





# For future improvements 
# - Place copy of these in dev-tools and then add this script here too 
# - Create a dynamic NAMESPACE for COO vs. OBO namespaces 