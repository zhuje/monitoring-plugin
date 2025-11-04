---
name: perses-dev
description: Setup a development environment for monitoring-console-plugin + perses
parameters:
  - name: perses_path
  - description: The path on the local machine that points to a clone of https://github.com/perses/perses (e.g. /User/bob/git_repos/perses)
  - required: true
---

If the user did not enter the parameter perses_path. Prompt them to enter a path through the user input. Then, if the path they entered isn't valid look around the local machine to grep for a clone of the [perses](https://github.com/perses/perses).

1. **Verify prerequisites**: 
- Check for tmux (e.g. `which tmux`)
    - If its not install, try installing it 
- OpenShift CLI (e.g. `which oc`)
    - If its not install, try installing it 
<!-- - Validate the user is logged into a openshift cluster (e.g. `oc status`)
    - If the user is not logged in or unable to connect to a cluster then exit this command  -->
- If not a linux machine, validate that podman or docker is running (e.g. `which podman || which docker`)

2. **Create tmux session**: Set up 6-pane (monitoring + Perses) layout
- label each pane in the tmux session
- Panel 1 
    - Path: monitoring-plugin (root of this repo)
    - Label: monitoring-console-plugin-frontend 
    - Run: check if `node_modules` exists if not run `make install`, then run `make start-frontend`
- Panel 2
    - Path: monitoring-plugin (root of this repo)
    - Label: monitoring-console-plugin-console  
    - Run: make start-feature-console
- Panel 3 
    - Path: monitoring-plugin (root of this repo)
    - Label: monitoring-console-plugin-backend 
    - Run: make start-feature-backend
- Panel 4 
    - Path: monitoring-plugin (root of this repo)
    - Label: port-forward-promtheus-operator
    - Description: 
    - Run: oc port-forward -n openshift-monitoring service/prometheus-operated 9090:9090
- Panel 5 
    - Path: `perses_path`
    - Label: perses-backend
    - Description: 
    - Run: ./scripts/api_backend_dev.sh
- Panel 6 
    - Path: `perses_path`/ui
    - Label: perses-ui
    - Run: check if `node_modules` exists if not run `npm install`, then run `npm run start` 

3. **Show user localhost and tmux** 
Ask the user if they would like to 
1. Open web-browser to openshift console platform http://localhost:9000
2. Open web-browswer to perses http://localhost:3000 
3. Open this tmux session in a new terminal; if not tell them how to log into the tmux session
