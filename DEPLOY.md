# Deployment

[`.env` Example](.env.example) · [GHCR Docker Image](https://github.com/wuespace/deno-asn-generator/pkgs/container/deno-asn-generator) · Docker Hub Docker Image (coming soon) · [JSR Package](https://jsr.io/@wuespace/asn-generator) · [GitHub Repository](https://github.com/wuespace/deno-asn-generator)

The app can be deployed in multiple ways, each with its own advantages and disadvantages. The following are the most common ways to deploy the app:

- [Docker](#docker): The app can be deployed using Docker and Docker Compose. This is the easiest way to deploy the app.
- [Portainer](#portainer): Portainer is a lightweight management UI that allows you to easily manage your Docker host or Swarm cluster. There are some specific steps to deploy the app using Portainer, which is why it has its own section.
- [Deno + JSR](#deno--jsr): The app can be deployed using Deno and JSR. Unfortunately, while most features will work, as the JSR currently doesn't support `.tsx` files, the UI in the web application won't work. **This is not recommended for production use due to current JSR limitations.**
- [Deno + Git](#deno--git): The app can be deployed using Deno and Git. This is the most manual way to deploy the app, but also the most flexible. And it isn't that hard to do. **This is not recommended for production use.**

## Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Portainer

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Portainer](https://www.portainer.io/installation/)

## Deno + JSR

### Prerequisites

- [Deno](https://deno.land/#installation)

## Deno + Git

### Prerequisites

- [Deno](https://deno.land/#installation)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
