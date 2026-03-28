FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create .env file with Docker defaults if not present
RUN if [ ! -f .env ]; then \
    echo "NODE_ENV=development" > .env && \
    echo "PORT=5000" >> .env && \
    echo "DB_HOST=postgres" >> .env && \
    echo "DB_PORT=5432" >> .env && \
    echo "DB_USER=aggimallaabhishek" >> .env && \
    echo "DB_PASSWORD=taskmaster_dev_password" >> .env && \
    echo "DB_NAME=taskmaster" >> .env && \
    echo "SESSION_SECRET=docker-dev-secret-key-change-in-production" >> .env && \
    echo "LOG_LEVEL=debug" >> .env && \
    echo "LOG_FORMAT=json" >> .env; \
    fi

EXPOSE 5000

CMD ["npm", "start"]
