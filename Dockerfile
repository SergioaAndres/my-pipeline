FROM python:3.9.13-slim as build
COPY .build /asset-build
COPY src /asset-dev/src

WORKDIR /asset-dev
RUN pip install --no-cache-dir --upgrade pip==22.2.2 &&\
    pip install --no-cache-dir --root-user-action=ignore -r /asset-build/dev.requirements.txt
# Dependency check
FROM build as dependency-check
RUN python -m pip_audit -r /asset-build/requirements.txt -o /asset-build/audit.txt

# Linter rules check
FROM build as lint-check
RUN pylint src/* --fail-under 8.5 --disable E0401 --output-format=json:/asset-dev/lint-result.json,colorized

# Unit test check
FROM build as test-coverage
RUN coverage run --branch --omit "*/__init__.py" --data-file "/asset-test/.coverage" -m pytest /asset-dev/src/ &&\
    coverage xml -i -o "/asset-test/coverage.xml" --data-file "/asset-test/.coverage" --include="/asset-dev/src/*" --omit "*/__init__.py" &&\
    coverage report --include "/asset-dev/src/*" --data-file "/asset-test/.coverage" -m

FROM snyk/snyk:python-3.9 as snyk
ARG SNYK_TOKEN
COPY .build /app
RUN pip install --no-cache-dir -r requirements.txt &&\
    snyk test --file=requirements.txt --json-file-output=/app/snyk-result.json

FROM sonarsource/sonar-scanner-cli:4.7.0 as sonar
ARG SONAR_HOST_URL
ARG SONAR_TOKEN
COPY --from=test-coverage /asset-test /asset-dev
COPY src /asset-dev/src
COPY sonar-project.properties version.txt /asset-dev/
WORKDIR /asset-dev
RUN sonar-scanner -Dsonar.login=$SONAR_TOKEN -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.projectVersion="$(cat version.txt)"

FROM build as builder
COPY --from=dependency-check /asset-build/audit.txt .
COPY --from=lint-check /asset-dev/lint-result.json .
COPY --from=sonar /asset-dev/.scannerwork/report-task.txt .
COPY --from=test-coverage /asset-test/.coverage .
COPY --from=snyk /app/snyk-result.json .
COPY src/app /asset/src/app
WORKDIR /asset
RUN pip install --root-user-action=ignore --no-cache-dir -r /asset-build/requirements.txt -t /asset

FROM python:3.9-slim as final
COPY --from=builder /asset /asset
