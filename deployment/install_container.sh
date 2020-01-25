# Read container ids
containers=$(docker ps -a --filter="ancestor=renkman/renkbench" | awk 'FNR == 1 {next} { print $1 }')

# Check whether containers are running and stop and remove them
if [[ -n $containers ]]
then
    docker rm $(docker stop $containers)
fi

# Get and run container
docker pull renkman/renkbench:latest
docker run -d -p 80:8080 renkman/renkbench