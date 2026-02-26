FROM node:20.17.0-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
USER node
EXPOSE 8000
CMD ["node", "dist/app.js"]