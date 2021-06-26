FROM golang:1.16 as build

ENV GO111MODULE=on
ENV CGO_ENABLED=0

# Node
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash
RUN apt-get install -y nodejs

# Yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install -y yarn

WORKDIR /app

# Build frontend
ADD web ./web
RUN yarn --cwd web install --frozen-lockfile
RUN yarn --cwd web build

# Build backend
ADD docs ./docs
ADD internal ./internal
ADD pkg ./pkg
ADD web/build ./web/build
ADD go.mod .
ADD go.sum .
ADD main.go .

RUN go build -o clearcloud
RUN chmod +x /app/clearcloud

FROM scratch
COPY --from=build /app/clearcloud /app/

EXPOSE 5555

ENV POSTGRES_HOST=localhost
ENV POSTGRES_DB=clearcloud
ENV POSTGRES_USER=clearcloud
ENV POSTGRES_PASSWORD=clearcloud
ENV POSTGRES_PORT=5432

ENTRYPOINT ["/app/clearcloud"]