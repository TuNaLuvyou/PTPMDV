FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY . .
RUN npx prisma generate || true
EXPOSE 4002
CMD ["node", "server.js"]
