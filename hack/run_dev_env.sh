#!/bin/zsh

# ==============================================================================
# TMUX Development Workspace Setup
# ==============================================================================
# This script creates a tmux session for development. It can optionally
# include panels for the Perses project based on user input.

# --- Configuration ---
readonly PERSSES_PATH="/Users/jezhu/Git/perses_core"
readonly MONITORING_PATH="/Users/jezhu/Git/monitoring-plugin"
readonly SESSION_NAME="dev_combined"

# --- User Input ---
# Ask the user if Perses panels should be enabled.
read -q "REPLY?Enable Perses panels? (y/n): "
echo # Adds a newline for cleaner output after the prompt.

# --- Pre-flight Checks ---
# 1. Check for required command-line tools.
if ! command -v tmux &> /dev/null; then
    echo "❌ Error: tmux is not installed. Please install it to continue." >&2
    exit 1
fi

if ! command -v oc &> /dev/null; then
    echo "❌ Error: 'oc' (OpenShift CLI) is not installed. Please install it to continue." >&2
    exit 1
fi

# 2. Check if the oc login is valid and the cluster is reachable.
echo "🔎 Verifying OpenShift cluster connection..."
if ! oc status > /dev/null; then
    echo "❌ Error: 'oc' login is not valid or the cluster is unreachable." >&2
    echo "   Please run 'oc login' to connect to your OpenShift cluster and try again." >&2
    exit 1
fi
echo "✅ OpenShift connection is valid."

# 3. Check for project directories.
if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    if [[ ! -d "$PERSSES_PATH" ]]; then
        echo "❌ Error: Perses path not found: $PERSSES_PATH" >&2
        exit 1
    fi
fi
if [[ ! -d "$MONITORING_PATH" ]]; then
    echo "❌ Error: Monitoring plugin path not found: $MONITORING_PATH" >&2
    exit 1
fi

# --- Session Management ---
tmux has-session -t "$SESSION_NAME" 2>/dev/null && tmux kill-session -t "$SESSION_NAME"
echo "🚀 Starting new tmux session: $SESSION_NAME"

# --- Conditional Pane Creation ---
if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    # --- TRUE: Create 6-PANE LAYOUT (Perses + Monitoring) ---
    echo "✅ Perses enabled. Creating 6-pane layout..."

    # Panel 1: Perses backend (starts the session)
    tmux new-session -d -s "$SESSION_NAME" -c "$PERSSES_PATH" \
      "./scripts/api_backend_dev.sh"

    # Panel 2: Perses frontend (split right)
    tmux split-window -h -t "$SESSION_NAME:0" -c "$PERSSES_PATH/ui" \
      "npm run start"

    # Panel 3: Monitoring-plugin frontend (split pane 1 down)
    tmux split-window -v -t "$SESSION_NAME:0.0" -c "$MONITORING_PATH" \
      "make start-frontend"

    # Panel 4: Monitoring-plugin feature console (split pane 2 down)
    tmux split-window -v -t "$SESSION_NAME:0.1" -c "$MONITORING_PATH" \
      "make start-feature-console"

    # Panel 5: Monitoring-plugin backend (split pane 3 right)
    tmux split-window -h -t "$SESSION_NAME:0.2" -c "$MONITORING_PATH" \
      "make start-feature-backend"

    # Panel 6: Monitoring-plugin port-forward (split pane 4 right)
    tmux split-window -h -t "$SESSION_NAME:0.3" -c "$MONITORING_PATH" \
      "oc port-forward -n openshift-monitoring service/prometheus-operated 9090:9090"

else
    # --- FALSE: Create 4-PANE LAYOUT (Monitoring Only) ---
    echo "👍 Skipping Perses. Creating 4-pane layout for monitoring..."

    # Panel 1: Monitoring-plugin frontend (starts the session)
    tmux new-session -d -s "$SESSION_NAME" -c "$MONITORING_PATH" \
      "make start-frontend"

    # Panel 2: Monitoring-plugin feature console (split right)
    tmux split-window -h -t "$SESSION_NAME:0" -c "$MONITORING_PATH" \
      "make start-feature-console"

    # Panel 3: Monitoring-plugin backend (split pane 1 down)
    tmux split-window -v -t "$SESSION_NAME:0.0" -c "$MONITORING_PATH" \
      "make start-feature-backend"

    # Panel 4: Monitoring-plugin port-forward (split pane 2 down)
    tmux split-window -v -t "$SESSION_NAME:0.1" -c "$MONITORING_PATH" \
      "oc port-forward -n openshift-monitoring service/prometheus-operated 9090:9090"
fi

# --- Finalization ---
# Select a balanced layout. This works great for both 4 and 6 panes.
tmux select-layout -t "$SESSION_NAME:0" tiled

# Attach to the newly created session.
echo "🎉 Session '$SESSION_NAME' is ready. Attaching now..."
tmux attach-session -t "$SESSION_NAME"