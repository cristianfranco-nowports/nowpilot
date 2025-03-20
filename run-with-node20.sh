#!/bin/bash
command -v nvm > /dev/null 2>&1 || { echo "nvm is not installed. Install it from https://github.com/nvm-sh/nvm"; exit 1; }
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npx kill-port 3000
nvm use 20
NODE_OPTIONS='--no-warnings' PORT=3000 npm run dev
