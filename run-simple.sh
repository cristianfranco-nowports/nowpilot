#!/bin/bash

npx kill-port 3000
NODE_ENV=production PORT=3000 npm run dev
