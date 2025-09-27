
#!/bin/bash

sudo apt update

sudo apt install -y openjdk-17-jre wget curl git unzip

sudo apt-get install -y docker.io

sudo apt-get install -y docker-compose-v2

sudo usermod -aG docker ubuntu

newgrp docker

ps -ef | grep agent.jar
