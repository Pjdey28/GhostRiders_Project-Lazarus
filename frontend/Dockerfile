# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Accept build argument for API URL
ARG REACT_APP_API_URL=

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the React app with API URL
RUN REACT_APP_API_URL=$REACT_APP_API_URL npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
