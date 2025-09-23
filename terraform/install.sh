#!/bin/bash


sudo apt update

sudo apt install -y openjdk-17-jdk unzip wget

cd ~ && wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-10.4.1.88267.zip

unzip sonarqube-10.4.1.88267.zip

mv sonarqube-10.4.1.88267 sonarqube

cd /sonarqube/bin/linux-x86-64 && ./sonar.sh start