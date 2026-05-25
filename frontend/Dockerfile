FROM node:20-slim

RUN npm install -g pnpm

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

RUN pnpm install --frozen-lockfile

COPY . .

# Set API URL environment variable for static page generation and requests
ENV NEXT_PUBLIC_API_URL=http://localhost:5000/api

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start"]
