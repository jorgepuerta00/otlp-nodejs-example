#!/bin/bash

# Set the context to the kind cluster
kubectl config use-context kind-otlp-demo-cluster

# Delete deployments
kubectl delete deployment otel-dice-deployment
kubectl delete deployment prometheus-deployment

# Delete services
kubectl delete service otel-dice-service

# Delete ConfigMaps
kubectl delete configmap otl-configmap
kubectl delete configmap prometheus-config

# Delete the kind cluster
# kind delete cluster --name otlp-demo-cluster
# echo "Kind cluster has been removed."

# Confirm deletion
echo "Clean-up complete. The Kubernetes environment has been removed."