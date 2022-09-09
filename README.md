# POC API

## v0.1.0

<Short description about the project>
This project contains all API resources for the POC

### Pre-requirements 📋

* [NodeJS v16.17.0](https://nodejs.org/en/)
* [aws-cdk v2.38.1](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
* [ptyhon 3.9.13](https://www.python.org/downloads/release/python-3913/)(optional)
* [Docker v20.10.16](https://www.docker.com/)

## Getting Started

To create the infrastructure and deploy the app follow the instructions:


1. Create the parameter store variables in the AWS pipeline account:

        sonarTokenPath : /pipelines/SonarToken
        sonarHostUrlPath : /pipelines/SonarHostUrl
        snykTokenPath: /pipelines/SnykToken
    
### Installation 🔧

[//]: # (A series of step-by-step examples that tells you what to run to have a development environment running)

1. Clone repository:

        git clone <Repo URL>

2. Go to the project folder:

        cd <Project folder name>

3. Update the config file in .iac/my-pipeline/config/config.yml and the sonar-project.properties file in the root of the repository

4. Setting up enviroment variables

        SNYK_TOKEN=<>
        SONAR_HOST_URL=<>
        SONAR_TOKEN=<>
        DOCKER_BUILDKIT=1

5. Install dependencies:

    To run cdk commands you will need Node.js installed on your machine. It is recommended to manage Node.js through NVM (node version manager).
    ```
    nvm ls-remote
    nvm install 16.17.0
    nvm use 16.17.0
    npm ci
    ```

6. SDLC

    Run Dockfile linter:
    ```bash
    "docker run --rm -i hadolint/hadolint < Dockerfile",
    ```
    Change directory to IaC:
    ```bash
    cd .iac/my-pipeline
    ```
    Install dependencies:
    ```bash
    npm ci
    ```
    Run linter:
    ```bash
    npm run eslint
    ```
    Build the cdk app:
    ```bash
    npm run build
    ```
    Boostrap the accounts:

    * For pipeline Account:
        ```bash
        npx cdk bootstrap aws://<pipelineAccountId>/us-east-2  --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess --qualifier poc --profile <>
        ```
    * For SDLC accounts:
        ```bash
        npx cdk bootstrap --trust <pipelineAccountId> aws://<AccountId>/us-east-2  --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess --qualifier poc --profile <>
        ```
    Execute cdk Synth to run python test(Using Dockerfile) and create the cdk.out:
    ```bash
    npx cdk synth --profile <>
    ```
    Execute IaC unit test:
    ```bash
    npm run test
    ```
    Run Snyk scan on cdk.out templates:
    ```bash
    npm run snyk-iac
    ```
    Deploy the application:
    ```bash
    npx cdk deploy --profile <>
    ```