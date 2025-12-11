FROM node:18-alpine
WORKDIR /srv
COPY package.json package-lock.json* ./
RUN npm install --production
COPY . .
ENV NODE_ENV=production
EXPOSE 80
CMD ["node", "index.js"]
