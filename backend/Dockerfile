FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
RUN npx prisma generate

COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

EXPOSE 5000

# Run compiled production code
CMD ["npm", "run", "start"]
