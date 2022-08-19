FROM apify/actor-node-playwright:16 AS builder

COPY package*.json tsconfig.json crawlee?json ./
COPY src ./src

# Install all dependencies (including dev deps) and build the project
RUN npm install --include=dev && npm run build

# Create final image
FROM apify/actor-node-playwright:16

# Copy only necessary files (crawlee.json might not exist, so we need the regexp trick with `crawlee?json`)
COPY --from=builder /usr/src/app/package.json /usr/src/app/crawlee?json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY apify.json README.md INPUT_SCHEMA.json ./

# Install only prod deps
RUN npm --quiet set progress=false \
    && npm install --only=prod --no-optional \
    && echo "Installed NPM packages:" \
    && (npm list --only=prod --no-optional --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version

ENV APIFY_DISABLE_OUTDATED_WARNING=1
# Run compiled code
CMD ./start_xvfb_and_run_cmd.sh && npm run start:prod
