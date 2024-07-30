#!/bin/bash

# Check if kind is installed
if ! command -v kind &> /dev/null
then
    echo "kind could not be found. Please install kind."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null
then
    echo "Docker is not running. Please start Docker."
    exit 1
fi

# Create a kind cluster
kind create cluster --name otlp-demo-cluster

# Verify if the kind cluster was created
if ! kind get clusters | grep -q "otlp-demo-cluster"; then
    echo "Kind cluster was not created successfully. Exiting."
    exit 1
fi

# Build the Docker image
docker build -t my-node-app .

# Load the Docker image into kind cluster
kind load docker-image my-node-app --name otlp-demo-cluster

# Apply Kubernetes manifests
kubectl apply -f k8s/otlp-configmap.yaml
kubectl apply -f k8s/prom-config.yaml
kubectl apply -f k8s/deploy.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/prom-deploy.yaml

# Check status
kubectl get pods
