FROM golang:1.16 as build

ENV GO111MODULE=on

WORKDIR /app
COPY . .

RUN ls -lah
RUN pwd
RUN go build -o clearcloud

FROM scratch
COPY --from=build /app/clearcloud /app/

EXPOSE 5555

ENTRYPOINT ["/app/clearcloud"]