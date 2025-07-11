#Step 1
FROM node:latest as node
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build-staging
#RUN npm run build-prod

#Step 2
FROM nginx:alpine
COPY --from=node /app/www /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# docker build -t mbn-warehouse-mobile-app-dev .
# docker build -t mbn-warehouse-mobile-app .