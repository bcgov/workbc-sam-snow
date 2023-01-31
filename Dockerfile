FROM artifacts.developer.gov.bc.ca/docker-remote/node:lts-alpine3.16
ENV NODE_ENV=production
WORKDIR /app
COPY . /app
RUN npm i --production
RUN npm run build
EXPOSE 8000
CMD ["node", "."]