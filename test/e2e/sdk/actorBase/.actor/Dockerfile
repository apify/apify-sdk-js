# Alpine, so that the platform-specific packages npm resolves here (Crawlee's native
# filesystem storage bindings among them) match the musl runtime image below.
FROM node:22-alpine AS builder

# Needed to install dependencies referenced by a git URL.
RUN apk add --no-cache git

COPY /package*.json ./
RUN npm --quiet set progress=false \
    && npm install --omit=dev --no-audit \
    && npm update

COPY /apify.tgz /apify.tgz
RUN npm --quiet install /apify.tgz

FROM apify/actor-node:22

RUN rm -r node_modules
COPY --from=builder /node_modules ./node_modules
COPY --from=builder /package*.json ./
COPY /.actor ./.actor
COPY /src ./src

RUN echo "Installed NPM packages:" \
    && (npm list --omit=dev --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version

CMD npm start --silent
