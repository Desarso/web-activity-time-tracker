FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787
ENV TRACKER_DATA_DIR=/data

COPY backend ./backend

RUN mkdir -p /data

EXPOSE 8787
VOLUME ["/data"]

CMD ["node", "backend/server.mjs"]
