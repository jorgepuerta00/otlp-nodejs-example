# syntax=docker/dockerfile:1

ARG NODE_VERSION=21.6.1
FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

RUN echo "@apex-org:registry=https://gitlab.com/api/v4/packages/npm/" > .npmrc && \
    echo "//gitlab.com/api/v4/packages/npm/:_authToken=${CI_JOB_TOKEN}" >> .npmrc

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

USER node

COPY . .

EXPOSE 5000

ENTRYPOINT ["npx", "ts-node", "app.ts"]
