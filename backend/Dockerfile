FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
RUN npx prisma generate

COPY . .

EXPOSE 5000

# Dev mode matches backend configuration and handles TypeScript source directly
CMD ["npm", "run", "dev"]
