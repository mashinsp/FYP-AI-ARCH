# Multi-stage build: Python dependencies + Node.js app
FROM node:20-bullseye as base

# Install system dependencies for OpenCV and other Python libraries
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.mjs ./
COPY postcss.config.mjs ./
COPY tailwind.config.ts ./
COPY requirements.txt ./

# Copy prisma schema (needed for prisma generate during npm install)
COPY prisma ./prisma

# Install Node dependencies
# Use --legacy-peer-deps to handle next-auth compatibility with Next.js 16
RUN npm ci --legacy-peer-deps

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
