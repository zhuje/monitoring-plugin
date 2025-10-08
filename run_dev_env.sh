#!/bin/zsh

# Name your tmux session
SESSION_NAME="hello_tmux"

# Create a new detached tmux session
tmux new-session -d -s "$SESSION_NAME"

# Split into 4 panes (2x2 layout)
tmux split-window -h -t "$SESSION_NAME":0        # right pane
tmux split-window -v -t "$SESSION_NAME":0.0      # bottom-left
tmux split-window -v -t "$SESSION_NAME":0.1      # bottom-right

# Send hello messages to each pane
tmux send-keys -t "$SESSION_NAME":0.0 'make start-frontend ' C-m
tmux send-keys -t "$SESSION_NAME":0.1 'make start-feature-console' C-m
tmux send-keys -t "$SESSION_NAME":0.2 'make start-feature-backend' C-m
tmux send-keys -t "$SESSION_NAME":0.3 'oc port-forward -n openshift-monitoring service/prometheus-operated 9090:9090' C-m

# Arrange layout nicely
tmux select-layout -t "$SESSION_NAME":0 tiled

# Attach to the session
tmux attach -t "$SESSION_NAME"

