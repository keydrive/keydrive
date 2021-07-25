FROM alpine:3

ARG TARGETPLATFORM

EXPOSE 5555

ENV POSTGRES_HOST=localhost
ENV POSTGRES_DB=keydrive
ENV POSTGRES_USER=keydrive
ENV POSTGRES_PASSWORD=keydrive
ENV POSTGRES_PORT=5432

RUN apk add --no-cache libc6-compat

ADD ${TARGETPLATFORM}/keydrive /
RUN chmod +x /keydrive

ENTRYPOINT ["/keydrive"]