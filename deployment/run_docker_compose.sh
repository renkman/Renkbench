# Read container ids
containers=$(docker ps -a | awk 'FNR == 1 {next} { print $1 }')

# Check whether containers are running and stop and remove them
if [[ -n $containers ]]
then
    docker rm $(docker stop $containers)
fi

# Get and run container
cd deploy
docker-compose pull
docker-compose stop
docker-compose rm -f
docker-compose up -d