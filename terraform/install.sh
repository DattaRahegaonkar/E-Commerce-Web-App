#!/bin/bash

sudo apt update
sudo apt install unzip -y

# Install AWS CLI

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install -i /usr/local/aws-cli -b /usr/local/bin --update
aws --version

# Install kubectl

curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin
kubectl version --short --client

# Install eksctl

curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz"
tar -xzf eksctl_Linux_amd64.tar.gz -C /tmp
sudo install -m 0755 /tmp/eksctl /usr/local/bin/eksctl
rm eksctl_Linux_amd64.tar.gz
rm /tmp/eksctl
eksctl version

# Install Helm
sudo apt update
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version

# Install Docker

sudo apt update
sudo apt install docker.io docker-compose-v2 -y

sudo systemctl enable docker
sudo systemctl start docker

# add the current user to the docker group to run docker commands without sudo
sudo usermod -aG docker ubuntu
newgrp docker

# Install Jenkins

sudo apt update
sudo apt install fontconfig openjdk-21-jre -y
java -version

sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key

echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install jenkins -y

sudo systemctl enable jenkins
sudo systemctl start jenkins

# add the jenkins user to the docker group to run docker commands without sudo
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Install Nginx
sudo apt update
sudo apt install nginx -y

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Configure Nginx as a reverse proxy for Jenkins
sudo tee /etc/nginx/sites-available/jenkins > /dev/null <<'EOF'
server {
    listen 80;
    server_name jenkins.rahegaonkar.online;

    location / {
        proxy_pass http://127.0.0.1:8080;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Disable default Nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Enable Jenkins site
sudo ln -sf /etc/nginx/sites-available/jenkins /etc/nginx/sites-enabled/jenkins

# Test configuration and reload Nginx
sudo nginx -t && sudo systemctl reload nginx
