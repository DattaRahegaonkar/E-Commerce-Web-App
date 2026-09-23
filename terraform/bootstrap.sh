#!/bin/bash

# ArgoCD Namespace Creation
kubectl create namespace argocd

# ArgoCD Helm Repo
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# ArgoCD Installation
helm install argocd argo/argo-cd -n argocd

# Install Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.15.1/deploy/static/provider/cloud/deploy.yaml

# Install ArgoCD CLI
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64
argocd version --client

# Install Image Upadate
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/v0.14.0/manifests/install.yaml

