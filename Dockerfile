# ================================
# Multi-stage Dockerfile for Production
# ================================

# Stage 1: Build Frontend (Vite React App)
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy frontend source code
COPY index.html ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY jsconfig.json ./
COPY components.json ./
COPY eslint.config.js ./
COPY src ./src

# Build the frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Stage 3: Production Image
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy backend dependencies from builder
COPY --from=backend-builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy backend source code
COPY --chown=nodejs:nodejs server ./server
COPY --chown=nodejs:nodejs package*.json ./

# Copy built frontend from frontend-builder
COPY --from=frontend-builder --chown=nodejs:nodejs /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server/app.js"]
