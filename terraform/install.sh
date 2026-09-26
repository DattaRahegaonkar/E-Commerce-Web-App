```bash
#!/bin/bash

set -e

# ============================================================
# System Update
# ============================================================

sudo apt update
sudo apt install -y unzip


# ============================================================
# AWS CLI
# ============================================================

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" \
  -o awscliv2.zip

unzip -q awscliv2.zip

sudo ./aws/install \
  -i /usr/local/aws-cli \
  -b /usr/local/bin \
  --update

rm -rf aws awscliv2.zip

aws --version


# ============================================================
# kubectl
# ============================================================

curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

chmod +x kubectl
sudo mv kubectl /usr/local/bin/kubectl

kubectl version --client


# ============================================================
# eksctl
# ============================================================

curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz"

tar -xzf eksctl_Linux_amd64.tar.gz -C /tmp

sudo install -m 0755 /tmp/eksctl /usr/local/bin/eksctl

rm -f eksctl_Linux_amd64.tar.gz
rm -f /tmp/eksctl

eksctl version


# ============================================================
# Helm
# ============================================================

curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

helm version


# ============================================================
# Docker
# ============================================================

sudo apt update
sudo apt install -y docker.io docker-compose-v2

sudo systemctl enable docker
sudo systemctl start docker

# Add current user to Docker group
sudo usermod -aG docker "$USER"

# Add Jenkins user to Docker group
# Jenkins is installed below, so this is done again after installation.


# ============================================================
# Jenkins
# ============================================================

sudo apt update
sudo apt install -y fontconfig openjdk-21-jre

java -version

# Jenkins repository key
sudo mkdir -p /etc/apt/keyrings

sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key

echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install -y jenkins

sudo systemctl enable jenkins
sudo systemctl start jenkins

# Allow Jenkins to use Docker
sudo usermod -aG docker jenkins
newgrp docker

sudo systemctl restart jenkins


# ============================================================
# Nginx
# ============================================================

sudo apt update
sudo apt install -y nginx

sudo systemctl enable nginx
sudo systemctl start nginx


# ============================================================
# Jenkins Nginx Reverse Proxy
# ============================================================

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


# ============================================================
# Enable Jenkins Nginx Site
# ============================================================

sudo rm -f /etc/nginx/sites-enabled/default

sudo ln -sf \
  /etc/nginx/sites-available/jenkins \
  /etc/nginx/sites-enabled/jenkins


# ============================================================
# Test and Reload Nginx
# ============================================================

sudo nginx -t

sudo systemctl reload nginx


# ============================================================
# Done
# ============================================================

echo ""
echo "============================================================"
echo "Bastion bootstrap completed successfully!"
echo "============================================================"
echo ""
echo "Installed:"
echo "  - AWS CLI"
echo "  - kubectl"
echo "  - eksctl"
echo "  - Helm"
echo "  - Docker"
echo "  - Docker Compose"
echo "  - Jenkins"
echo "  - Nginx"
echo ""
echo "Jenkins:"
echo "  http://jenkins.rahegaonkar.online"
echo ""
echo "NOTE: Log out and log back in for the Docker group"
echo "      change to apply to your current user."
echo ""
```
