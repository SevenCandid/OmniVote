# Development Dockerfile for OmniVote Web (Vite + React)
FROM node:22-alpine

WORKDIR /workspace/web

# Install dependencies utilizing Docker build cache with legacy peer deps flag
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose Vite development port
EXPOSE 5173

# Start Vite server in host-bound development mode
CMD ["npm", "run", "dev"]
