FROM apify/actor-node:22 AS builder

COPY package*.json ./

RUN npm install --include=dev --audit=false

COPY . ./

RUN npm run build

FROM apify/actor-node:22

COPY --from=builder /usr/src/app/dist ./dist

COPY package*.json ./

RUN rm -rf node_modules \
    && npm --quiet set progress=false \
    && npm install --omit=dev --omit=optional \
    && echo "Installed NPM packages:" \
    && (npm list --omit=dev --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version \
    && rm -r ~/.npm

COPY . ./

ENV APIFY_DISABLE_OUTDATED_WARNING=1

CMD npm run start:prod --silent
