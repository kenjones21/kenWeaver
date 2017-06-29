#!/bin/bash
echo "Ending NodeJS development environment..."

# Kill grunt
tmux select-pane -t 1
tmux send-keys C-c

# Kill nodemon
tmux select-pane -t 0
tmux send-keys C-c

# Kill mongo
tmux select-pane -t 2
tmux send-keys C-c

# Kill tmux session
tmux kill-session -t my_server

echo "Development environment closed!"
