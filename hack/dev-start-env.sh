#!/bin/zsh

# ==============================================================================
# TMUX Development Workspace Setup
# ==============================================================================
# This script creates a tmux session for development. It can optionally
# include panels for the Perses project based on user input.

# --- Configuration ---
readonly PERSES_PATH="/Users/jezhu/Git/perses_core"
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
    if [[ ! -d "$PERSES_PATH" ]]; then
        echo "❌ Error: Perses path not found: $PERSES_PATH" >&2
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
# NOTE: We append "; exec ${SHELL:-zsh}" to each command.
# This ensures that when the initial command finishes, the pane remains
# open with an active shell prompt.
if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    # --- TRUE: Create 6-PANE LAYOUT (Perses + Monitoring) ---
    echo "✅ Perses enabled. Creating 6-pane layout..."

    tmux new-session -d -s "$SESSION_NAME" -c "$PERSES_PATH" \
      "./scripts/api_backend_dev.sh; exec ${SHELL:-zsh}"

    tmux split-window -h -t "$SESSION_NAME:0" -c "$PERSES_PATH/ui" \
      "npm run start; exec ${SHELL:-zsh}"

    tmux split-window -v -t "$SESSION_NAME:0.0" -c "$MONITORING_PATH" \
      "make start-frontend; exec ${SHELL:-zsh}"

    tmux split-window -v -t "$SESSION_NAME:0.1" -c "$MONITORING_PATH" \
      "make start-feature-console; exec ${SHELL:-zsh}"

    tmux split-window -h -t "$SESSION_NAME:0.2" -c "$MONITORING_PATH" \
      "make start-feature-backend; exec ${SHELL:-zsh}"

    tmux split-window -h -t "$SESSION_NAME:0.3" -c "$MONITORING_PATH" \
      "oc port-forward -n openshift-monitoring service/prometheus-operated 9090:9090; exec ${SHELL:-zsh}"

else
    # --- FALSE: Create 4-PANE LAYOUT (Monitoring Only) ---
    echo "👍 Skipping Perses. Creating 4-pane layout for monitoring..."

    tmux new-session -d -s "$SESSION_NAME" -c "$MONITORING_PATH" \
      "make start-frontend; exec ${SHELL:-zsh}"

    tmux split-window -h -t "$SESSION_NAME:0" -c "$MONITORING_PATH" \
      "make start-feature-console; exec ${SHELL:-zsh}"

    tmux split-window -v -t "$SESSION_NAME:0.0" -c "$MONITORING_PATH" \
      "make start-feature-backend; exec ${SHELL:-zsh}"

    tmux split-window -v -t "$SESSION_NAME:0.1" -c "$MONITORING_PATH" \
      "oc port-forward -n openshift-monitoring service/prometheus-operated 9090:9090; exec ${SHELL:-zsh}"
fi

# --- Finalization ---
tmux select-layout -t "$SESSION_NAME:0" tiled

echo "🎉 Session '$SESSION_NAME' is ready. Attaching now..."
tmux attach-session -t "$SESSION_NAME"