# ClearCloud

This repository contains the source code of the ClearCloud project: a personal file management and sharing application.

## Installation

The project is not ready yet. We provide no installation.

## Development

To set up your development environment, install the following software:

1. Docker v20+
2. Go v1.16+
3. Node v16+
4. Yarn v1.22

To start the backend:

```bash
# Start all dependencies
docker compose up -d
# Download go libs
go get
# Optional: update the api docs
swag init
# Start the backend
go run ./main.go
```

You can now access the api docs at http://localhost:5555/docs/index.html

To start the frontend:

```bash
# Open the project folder
cd web
# Install dependencies
yarn
# Start the frontend
yarn start
```

You can now access the application at http://localhost:3000