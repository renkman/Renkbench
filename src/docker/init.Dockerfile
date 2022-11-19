FROM golang:1.18.1-bullseye as build

WORKDIR /src

COPY ./api ./api

WORKDIR /src/api
RUN go build cmd/init-db/init.go

FROM gcr.io/distroless/base-debian11 as init

WORKDIR /app

COPY --from=build /src/api .

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT [ "/app/init" ]

FROM build as test

WORKDIR /src/api

CMD [ "go", "test", "-v", "./..." ]
