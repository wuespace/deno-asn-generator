# Deployment

[`.env` Example](example.env) ·
[GHCR Docker Image](https://github.com/wuespace/deno-asn-generator/pkgs/container/deno-asn-generator)
· Docker Hub Docker Image (coming soon) ·
[JSR Package](https://jsr.io/@wuespace/asn-generator) ·
[GitHub Repository](https://github.com/wuespace/deno-asn-generator)

---

The app can be deployed in multiple ways, each with its own advantages and
disadvantages. The following are the most common ways to deploy the app:

- [Docker](#docker): The app can be deployed using Docker and Docker Compose.
  This is the easiest way to deploy the app.
- [Portainer](#portainer): Portainer is a lightweight management UI that allows
  you to easily manage your Docker host or Swarm cluster. There are some
  specific steps to deploy the app using Portainer, which is why it has its own
  section.
- [Deno + JSR](#deno--jsr): The app can be deployed using Deno and JSR.
  Unfortunately, while most features will work, as the JSR currently doesn't
  support `.tsx` files, the UI in the web application won't work. **This is not
  recommended for production use due to current JSR limitations.**
- [Deno + Git](#deno--git): The app can be deployed using Deno and Git. This is
  the most manual way to deploy the app, but also the most flexible. And it
  isn't that hard to do. **This is not recommended for production use.**

## Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

In an installation directory of your choice, create a new directory for the app.

In this directory, create a new file called `.env` and copy the contents of the
[`.env` Example](env.example) into it.

Carefully adjust the values in the `.env` file to your needs.

Create a new file called `compose.yml` and copy the following contents into it:

```yaml
name: deno-asn-generator

services:
  app:
    image: ghcr.io/wuespace/deno-asn-generator:latest
    restart: unless-stopped
    ports:
      - "127.0.0.1:${HOST_PORT}:8080"
    volumes:
      - app-data:/app/data
    env_file: .env

volumes:
  app-data:
```

To be safer, you can also specify the version of the app by replacing `latest`
with the version you want to use.

### Running the Web Application

To start the app, run the following command in the installation directory:

```sh
docker compose up -d
```

To stop the app, run the following command in the installation directory:

```sh
docker compose down
```

### Running the CLI

To run the CLI, run the following command in the installation directory:

```sh
docker compose run app --help
```

You can replace `--help` with any other command you want to run.

### Updating the App

To update the app, run the following command in the installation directory:

```sh
docker compose down \
  && docker compose pull \
  && docker compose up -d
```

## Portainer

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Portainer](https://www.portainer.io/installation/)

### Installation

Log into your Portainer instance and create a new stack.

Enter a name for the stack, e.g., `asn-generator`.

In the _Web Editor_ section, paste the following contents:

```yaml
services:
  app:
    image: ghcr.io/wuespace/deno-asn-generator:latest
    restart: unless-stopped
    ports:
      - "127.0.0.1:${HOST_PORT}:8080"
    volumes:
      - app-data:/app/data
    env_file: stack.env

volumes:
  app-data:
```

Download the [`.env` Example](env.example). In the _Environment variables_
section, select **Load variables from .env file** and upload the `example.env`
file.

Carefully adjust the environment variable values to your needs. You can find
more information about the environment variables in the
[`.env` Example](env.example).

Click **Deploy the stack**.

### Running the Web Application

By deploying the stack, the web application should be available at the specified
port.

### Running the CLI

In the Portainer UI, navigate to the container running the app.

Click on **Exec Console**.

As _Command_, choose `/bin/bash`.

Click **Connect**.

In the terminal that opens, run the following command:

```sh
deno task run --help
```

You can replace `--help` with any other command you want to run.

Once you're done, click **Disconnect**.

### Updating the App

In the Portainer UI, navigate to the stack running the app.

Open the _Editor_ tab.

Without changing anything, at the bottom of the tab, click **Update the stack**.

Enable **Re-pull image and redeploy** and click **Update**.

The app should now be updated.

## Deno + JSR

### Prerequisites

- [Deno](https://deno.land/#installation)

### Installation

Create a new directory for the app. In this directory, create a new file called
`.env` and copy the contents of the [`.env` Example](env.example) into it.

Carefully adjust the values in the `.env` file to your needs.

> [!TIP] Note that you can also adjust the commented out variables that you
> could not adjust in the Docker deployment method, such as `PORT` or
> `DATA_DIR`.

### Running the Web Application

> [!WARNING] This deployment method is not recommended for production use due to
> current JSR limitations. The UI in the web application won't work.
>
> If you want to use the web application, please use the Docker or Deno + Git
> deployment method.

To start the app, run the following command in the installation directory:

```sh
deno run -A --unstable-kv jsr:@wuespace/asn-generator
```

### Running the CLI

To run the CLI, run the following command in the installation directory:

```sh
deno run -A --unstable jsr:@wuespace/asn-generator --help
```

You can replace `--help` with any other command you want to run.

### Updating the App

You can specify the version of the app by appending `@<version>` to the JSR URL:

```sh
deno run -A --unstable-kv jsr:@wuespace/asn-generator@0.2.1
```

If the version is not downloaded yet, it will be downloaded and cached. To
update the app, you can run the same command again with a different version.

## Deno + Git

### Prerequisites

- [Deno](https://deno.land/#installation)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

### Installation

Navigate to the installation directory of your choice.

Clone the repository:

```sh
git clone https://github.com/wuespace/deno-asn-generator.git \
  && cd deno-asn-generator
```

Copy the contents of the [`.env` Example](env.example) into a new file called
`.env`. You can easily do this by running the following command:

```sh
cp env.example .env
```

Carefully adjust the values in the `.env` file to your needs.

> [!TIP] Note that you can also adjust the commented out variables that you
> could not adjust in the Docker deployment method, such as `PORT` or
> `DATA_DIR`.

### Running the Web Application

To start the app, run the following command in the installation directory:

```sh
deno task run
```

### Running the CLI

To run the CLI, run the following command in the installation directory:

```sh
deno task run --help
```

You can replace `--help` with any other command you want to run.

### Updating the App

To update the app, simply pull the latest changes from the repository:

```sh
git pull
```

To pin the app to a specific version, you can checkout a specific tag:

```sh
git checkout v0.2.1
```

Note that your `.env` file and `./data` folder are not tracked by Git, so you
don't have to worry about them being overwritten.
