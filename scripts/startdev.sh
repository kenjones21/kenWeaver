#!/bin/bash
echo "Starting NodeJS development environment..."

# Start tmux session
tmux new-session -d -s my_server -n nodedev

# Split tmux window into desired portions
tmux split-window -h
tmux split-window -v

# Start mongo in specified pane
tmux select-pane -t 2
tmux send-keys "mongod" C-m

# Start ndemon in a pane
tmux select-pane -t 0
tmux send-keys "nodemon server.js" C-m

# Start grunt in a pane
tmux select-pane -t 1
tmux send-keys "grunt" C-m

# Select the window and reattach
tmux select-window -t my_server:0
tmux attach-session -t my_server

echo "Dev environment started!"
