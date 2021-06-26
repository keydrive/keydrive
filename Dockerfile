FROM alpine:3

ARG TARGETPLATFORM

EXPOSE 5555

ENV POSTGRES_HOST=localhost
ENV POSTGRES_DB=clearcloud
ENV POSTGRES_USER=clearcloud
ENV POSTGRES_PASSWORD=clearcloud
ENV POSTGRES_PORT=5432

RUN apk add --no-cache libc6-compat

ADD ${TARGETPLATFORM}/clearcloud /clearcloud

ENTRYPOINT ["/clearcloud"]