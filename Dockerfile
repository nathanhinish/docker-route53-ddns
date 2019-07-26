FROM node:lts-alpine

WORKDIR /opt/app

ADD package.json \
    package-lock.json \
    start_interval.sh \
    ./
RUN npm ci
COPY src/ ./src/

CMD "./start_interval.sh"