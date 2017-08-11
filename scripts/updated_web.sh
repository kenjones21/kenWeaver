#!/bin/bash
echo "Updating kenweaver.me"

ssh kbweaver@kenweaver.me "cd kenWeaver/; git pull; exit"
