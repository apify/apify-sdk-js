FROM apify/actor-node:16 as builder

# Copy everything in the container
COPY . ./

# Log Node version
RUN echo "Node.js version:" && node --version

# Log npm version
RUN echo "NPM version:" && npm --version

# Install default dependencies, print versions of everything
RUN npm --quiet set progress=false \
	&& npm install && npm install typescript \
	&& echo "Installed NPM packages:" \
	&& (npm list || true)

# Run build script
RUN npm run build

# Copy the output for easy copying between containers
RUN mkdir /dist \
	&& cp -r ./dist/. /dist/

FROM apify/actor-node-puppeteer-chrome:16

COPY package*.json ./

# Log Node version
RUN echo "Node.js version:" && node --version

# Log npm version
RUN echo "NPM version:" && npm --version

# Install default dependencies, print versions of everything
RUN npm --quiet set progress=false \
	&& npm install --no-optional \
	&& echo "Installed NPM packages:" \
	&& (npm list || true)

COPY --from=builder /dist ./dist

ENV APIFY_DISABLE_OUTDATED_WARNING=1
