FROM node:latest as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY patch-devtools.js .
RUN node patch-devtools.js
COPY ./ .
RUN npm run build

FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/conf.d/default.conf