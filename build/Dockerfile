FROM ubuntu:focal

# General Packages
RUN apt-get update && \
  apt-get install -y software-properties-common && \
  add-apt-repository ppa:longsleep/golang-backports && \
  apt-get update && \
  apt-get install -y curl unzip

# Docker
ARG DOCKER_VERSION=20.10.7
RUN curl -sSL get.docker.com | bash

# Golang
RUN apt-get install -y golang-1.16
ENV PATH="$PATH:/usr/lib/go-1.16/bin:/root/go/bin"
RUN go get -u github.com/jstemmer/go-junit-report

# Node
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash
RUN apt-get install -y nodejs

# Yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install -y yarn

# Sonar
RUN curl -o sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.6.2.2472-linux.zip
RUN unzip sonar-scanner.zip
RUN mv sonar-scanner-* /opt/sonar-scanner
ENV PATH="$PATH:/opt/sonar-scanner/bin"
