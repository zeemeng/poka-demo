FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

COPY . .

RUN npm ci --omit=dev

CMD [ "node", "service.js" ]
