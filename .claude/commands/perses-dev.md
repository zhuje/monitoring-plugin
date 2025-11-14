---
name: perses-dev
description: Setup a development environment for monitoring-console-plugin + perses
parameters:
  - name: perses_path
  - description: The path on the local machine that points to a clone of https://github.com/perses/perses (e.g. /User/bob/git_repos/perses)
  - required: true
---

0. Ask the User if they would like the verify the prerequisites or they would like to skip it: 
- Check for tmux (e.g. `which tmux`)
    - If its not install, try installing it 
- OpenShift CLI (e.g. `which oc`)
    - If its not install, try installing it 
    - Validate the user is logged into a openshift cluster (e.g. `oc status`)
    - If the user is not logged in or unable to connect to a cluster then exit this commmand 
- If not a linux machine, validate that podman or docker is running (e.g. `which podman || which docker`) -->

1. Start a tmux sessions in this terminal with 8 equally sized panels 
- In bold output, tell the user the name of the session and tmux session tips like how to attach to sessions, detach a session, how to move around the panels using prefix + arrows, how to delete a session 
- Pane Layout: 
Pane 1 | Pane 2 | Pane 3 | Pane 4 
Pane 5 | Pane 6 | Pane 7 | Pane 8

2. Read perses-dev-config.yaml, output the perses_path. 
- If it doesn't exist then ask the user to input the perses_path. 
- Save this path in perses-dev-config.yaml, for example `perses_path: {user_input_path}`

3. Start the applications 
For each pane run the command and wait for the process to start running for 3 seconds before moving on to the next panel. 
If an error is encountered, diagnose and fix the issue before continuing to the next panel. 
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
    - Run: oc port-forward -n openshift-monitoring service/prometheus-operated 9090:9090
- Panel 5 
    - Path: `perses_path`
    - Label: perses-backend
    - Run: ./scripts/api_backend_dev.sh
- Panel 6 
    - Path: `perses_path`/ui
    - Label: perses-ui
    - Run: check if `node_modules` exists if not run `npm install`, then run `npm run start` 

4. Final checks 
- Do one more check to see if all the processes in each pane is running without error. If there is a error diagnose and fix it. 
- Then repeat information in step 0 about how to access the tmux session and tips to use tmux sessions
- Tell user that openshift console platform is located at  http://localhost:9000
- Tell user that perses is located at http://localhost:3000 
 