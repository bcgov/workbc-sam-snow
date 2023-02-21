FROM artifacts.developer.gov.bc.ca/docker-remote/node:19-alpine3.17
ENV NODE_ENV=production
WORKDIR /app
COPY . /app
RUN npm i --production
RUN npm run build
EXPOSE 8000
CMD ["node", "."]