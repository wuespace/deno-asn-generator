# Contributing

## Who can contribute?

### WüSpace e. V. Members

If you are a member of WüSpace e. V., you can contribute to this project without any prior approval. Just create a new branch, implement your changes, and create a pull request. If you are unsure about your changes, feel free to ask for feedback in the pull request.

Any contributions are covered by [§ 3 LizVO (Vereinsordnung der Lizenzen des WüSpace e. V.)](https://vos.wuespace.de/vo/lizvo/).

### External Contributors

At the moment, we do not accept code contributions from external contributors. However, you are welcome to create issues, ask questions, or suggest improvements. If you are interested in contributing code, please reach out to us via an issue and we will discuss the details.

## How to contribute?

### Development Environment

Either use the provided Docker environment or set up your own development environment. The Docker environment is the recommended way to get started quickly.

If you don't want to use Docker, you'll need to have Deno installed. You can find installation instructions on the [Deno website](https://deno.land/).

### Running the Project

#### Docker

To run the project using Docker, execute the following commands:

```bash
docker compose up --build
```

After making changes, you can restart the project using the same command.

#### Deno

If you want to run the project without Docker, execute the following command:

```bash
deno task dev
```

When making changes, the project will automatically restart.

### Release Process

The release process is fully automated. Maintainers can trigger a new release by running the following command:

```bash
deno task version
```

This command will prompt for the increment type (major, minor, patch, as well as prereleases).

After running the command, the release will be created. All you need to do is to push the changes to the repository:

```bash
git push --follow-tags
```

This will automatically release the artifacts to various platforms using GitHub Actions.
