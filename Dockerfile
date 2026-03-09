FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

ENV DATABASE_URL=$DATABASE_URL
ENV NEON_PROJECT_ID=$NEON_PROJECT_ID
ENV NEON_API_KEY=$NEON_API_KEY

# Create the subpath directory and copy the build assets
RUN mkdir -p /usr/share/nginx/html/know_your_value
COPY --from=builder /app/dist /usr/share/nginx/html/know_your_value

RUN rm /etc/nginx/conf.d/default.conf
COPY vite-nginx.conf /etc/nginx/conf.d/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
