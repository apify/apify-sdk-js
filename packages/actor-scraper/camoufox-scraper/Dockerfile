FROM apify/actor-node-playwright-firefox:20 AS builder

COPY --chown=myuser package*.json ./

RUN npm install --include=dev --audit=false

COPY --chown=myuser . ./

RUN npm run build

FROM apify/actor-node-playwright-firefox:20

COPY --from=builder --chown=myuser /home/myuser/dist ./dist

COPY --chown=myuser package*.json ./

RUN npm --quiet set progress=false \
    && npm install --omit=dev \
    && echo "Installed NPM packages:" \
    && (npm list --omit=dev --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version \
    && rm -r ~/.npm

RUN npm run get-binaries

COPY --chown=myuser . ./

RUN rm -rf ./pw-browsers/

ENV APIFY_DISABLE_OUTDATED_WARNING=1

CMD ./start_xvfb_and_run_cmd.sh && npm run start:prod --silent
