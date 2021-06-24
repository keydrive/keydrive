FROM golang:1.16 as build

ENV GO111MODULE=on

WORKDIR /app
ADD docs ./docs
ADD internal ./internal
ADD pkg ./pkg
ADD web/build ./web/build
ADD go.mod .
ADD go.sum .
ADD main.go .

RUN go build -o clearcloud

FROM scratch
COPY --from=build /app/clearcloud /app/

EXPOSE 5555

ENTRYPOINT ["/app/clearcloud"]