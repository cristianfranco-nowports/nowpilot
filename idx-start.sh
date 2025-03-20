#!/bin/bash
# Instalar babel-loader explícitamente
npm install babel-loader@8.2.5

# Configurar variables de entorno para deshabilitar SWC
export DISABLE_SWC=true

# Iniciar servidor Next.js
npm run dev -- --port 9002 --hostname 0.0.0.0 