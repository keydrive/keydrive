FROM golang:1.16 as build

ENV GO111MODULE=on
ENV CGO_ENABLED=0

WORKDIR /app
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
ENV POSTGRES_SSL=disable

ENTRYPOINT [ \
    "/app/clearcloud", \
    "--postgres-dsn=host='${POSTGRES_HOST}' user='${POSTGRES_USER}' password='${POSTGRES_PASSWORD}' dbname='${POSTGRES_DB}' port='${POSTGRES_PORT}' sslmode=${POSTGRES_SSL}" \
]