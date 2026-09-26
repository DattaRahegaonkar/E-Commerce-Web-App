```bash
#!/bin/bash

# Exit on error
set -e

# ============================================================
# Argo CD
# ============================================================

# ArgoCD Namespace
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

# ArgoCD Helm Repo
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# ArgoCD Installation
helm install argocd argo/argo-cd \
  -n argocd \
  --set server.metrics.enabled=true \
  --set server.metrics.service.enabled=true \
  --set server.metrics.serviceMonitor.enabled=true \
  --set controller.metrics.enabled=true \
  --set controller.metrics.service.enabled=true \
  --set controller.metrics.serviceMonitor.enabled=true \
  --set repoServer.metrics.enabled=true \
  --set repoServer.metrics.service.enabled=true \
  --set repoServer.metrics.serviceMonitor.enabled=true \
  --set applicationSet.metrics.enabled=true \
  --set applicationSet.metrics.service.enabled=true \
  --set applicationSet.metrics.serviceMonitor.enabled=true \
  --set notifications.metrics.enabled=true \
  --set notifications.metrics.service.enabled=true \
  --set notifications.metrics.serviceMonitor.enabled=true


# ============================================================
# Monitoring - Prometheus + Grafana
# ============================================================

# Monitoring Namespace
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

# Prometheus Community Helm Repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install kube-prometheus-stack
# - Prometheus discovers ServiceMonitors from all namespaces
# - ArgoCD dashboard 24192 is automatically imported into Grafana
helm install kube-prometheus-stack \
  prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set grafana.dashboards.default.argocd.gnetId=24192 \
  --set grafana.dashboards.default.argocd.revision=1 \
  --set grafana.dashboards.default.argocd.datasource=Prometheus


# ============================================================
# Argo CD Metrics Configuration
# ============================================================

# Reconfigure ArgoCD ServiceMonitors after Prometheus Operator
# is installed and the ServiceMonitor CRD is available.
helm upgrade argocd argo/argo-cd \
  -n argocd \
  --set server.metrics.enabled=true \
  --set server.metrics.service.enabled=true \
  --set server.metrics.serviceMonitor.enabled=true \
  --set controller.metrics.enabled=true \
  --set controller.metrics.service.enabled=true \
  --set controller.metrics.serviceMonitor.enabled=true \
  --set repoServer.metrics.enabled=true \
  --set repoServer.metrics.service.enabled=true \
  --set repoServer.metrics.serviceMonitor.enabled=true \
  --set applicationSet.metrics.enabled=true \
  --set applicationSet.metrics.service.enabled=true \
  --set applicationSet.metrics.serviceMonitor.enabled=true \
  --set notifications.metrics.enabled=true \
  --set notifications.metrics.service.enabled=true \
  --set notifications.metrics.serviceMonitor.enabled=true


# ============================================================
# NGINX Ingress Controller
# ============================================================

kubectl apply -f \
  https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.15.1/deploy/static/provider/cloud/deploy.yaml


# ============================================================
# Argo CD CLI
# ============================================================

curl -sSL -o argocd-linux-amd64 \
  https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64

sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd

rm argocd-linux-amd64

argocd version --client


# ============================================================
# Argo CD Image Updater
# ============================================================

kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/v0.14.0/manifests/install.yaml


# ============================================================
# Done
# ============================================================

echo ""
echo "============================================================"
echo "Bootstrap completed successfully!"
echo "============================================================"
echo ""
echo "Installed:"
echo "  - Argo CD"
echo "  - Argo CD Metrics"
echo "  - Prometheus"
echo "  - Grafana"
echo "  - Argo CD Grafana Dashboard (24192)"
echo "  - NGINX Ingress Controller"
echo "  - Argo CD CLI"
echo "  - Argo CD Image Updater"
echo ""
```
