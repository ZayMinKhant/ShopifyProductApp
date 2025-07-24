FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --omit=dev && npm cache clean --force

RUN npm uninstall @shopify/cli @shopify/theme 2>/dev/null || true

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]