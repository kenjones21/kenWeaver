#!/bin/bash
echo "Starting NodeJS development environment..."
service mongod start

# Start tmux session
tmux new-session -d -s my_server -n nodedev

# Split tmux window into desired portions
tmux split-window -v
tmux select-pane -t 0
tmux split-window -h

# Start mongo in specified pane
#tmux select-pane -t 2
#tmux send-keys "stylus -w src/stylus/main.styl -o src/public/stylesheets/main.css" C-m
#tmux send-keys "notify-send 'A'; tmux wait-for -S mongod-start" C-m\; wait-for mongod-start

# Start ndemon in a pane
tmux select-pane -t 0
tmux send-keys "nodejs server.js" C-m

# Start grunt in a pane
tmux select-pane -t 1
tmux send-keys "grunt" C-m

# Switch to user pane
tmux select-pane -t 2

# Select the window and reattach
tmux select-window -t my_server:0
tmux attach-session -t my_server

echo "Dev environment started!"
