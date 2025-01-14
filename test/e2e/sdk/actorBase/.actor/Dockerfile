FROM node:22 AS builder

COPY /package*.json ./
RUN npm --quiet set progress=false \
    && npm install --only=prod --no-optional --no-audit \
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
    && (npm list --only=prod --no-optional --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version

CMD npm start --silent
