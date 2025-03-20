#!/bin/bash
npx kill-port 3000
PORT=3000 NODE_ENV=production npm run dev
