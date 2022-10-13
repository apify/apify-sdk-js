FROM apify/actor-node-puppeteer-chrome:16 AS builder

COPY --chown=myuser package*.json ./

RUN npm install --include=dev --audit=false

COPY --chown=myuser . ./

RUN npm run build

FROM apify/actor-node-puppeteer-chrome:16

COPY --from=builder --chown=myuser /home/myuser/dist ./dist

COPY --chown=myuser package*.json ./

RUN npm --quiet set progress=false \
    && npm install --omit=dev --omit=optional \
    && echo "Installed NPM packages:" \
    && (npm list --omit=dev --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version \
    && rm -r ~/.npm

COPY --chown=myuser . ./

ENV APIFY_DISABLE_OUTDATED_WARNING=1

CMD npm run start:prod --silent
