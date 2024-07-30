#!/bin/bash

# Define the name of the kind cluster
CLUSTER_NAME="otlp-demo-cluster"

# Create a kind cluster
kind create cluster --name $CLUSTER_NAME

# Build the Docker image
docker build -t my-node-app .

# Load the Docker image into kind cluster
kind load docker-image my-node-app --name $CLUSTER_NAME

# Apply ConfigMaps
kubectl apply -f k8s/otlp-configmap.yaml
kubectl apply -f k8s/prom-config.yaml

# Apply Deployments and Services
kubectl apply -f k8s/deploy.yaml
kubectl apply -f k8s/prom-deploy.yaml
kubectl apply -f k8s/service.yaml

# Display the status of the pods
kubectl get pods

echo "Setup complete. Your kind cluster is running with the application and Prometheus deployed."