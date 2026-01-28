#!/bin/bash
# Install frontend dependencies
npm install --legacy-peer-deps

# Build the frontend
npm run build

# Install backend dependencies
pip install -r backend/requirements.txt
