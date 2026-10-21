FROM oven/bun:1-debian

RUN apt-get update \
    && apt-get install -y python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

RUN pip3 install --break-system-packages -r requirements.txt

RUN bun run build

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

EXPOSE 10000

CMD ["sh", "-c", "PORT=${PORT:-10000} bun .next/standalone/server.js"]
