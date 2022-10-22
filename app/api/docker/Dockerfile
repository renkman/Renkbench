FROM golang:1.18.1-bullseye as build

WORKDIR /src

COPY ./ ./

RUN go build

FROM gcr.io/distroless/base-debian11

WORKDIR /app

COPY --from=build /src/api .
COPY --from=build /src/workbench.json .

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT [ "/app/api" ]
