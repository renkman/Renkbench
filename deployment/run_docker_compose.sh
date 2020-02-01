#!/bin/bash

# Get and run container
if[ -n $1 ]
    then RELEASENUMBER=$1

cd deploy
docker-compose pull
docker-compose stop
docker-compose rm -f
docker-compose up -d