FROM node:18-alpine as builder

# Build arguments
ARG VITE_API_URL=http://backend:5000

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build with environment variable
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
