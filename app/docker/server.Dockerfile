FROM golang:1.18.1-bullseye as build

WORKDIR /src

COPY ./api ./api
COPY ./public ./public

WORKDIR /src/api
RUN go build cmd/server/server.go

FROM gcr.io/distroless/base-debian11 as app

WORKDIR /public
COPY --from=build /src/public .

WORKDIR /app
COPY --from=build /src/api .

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT [ "/app/server" ]

FROM build as test

WORKDIR /src/api

RUN pwd
RUN ls -la

CMD [ "go", "test", "-v", "./..." ]
