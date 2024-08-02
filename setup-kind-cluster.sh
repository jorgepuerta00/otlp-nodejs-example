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

# Check if the kind cluster already exists
if kind get clusters | grep -q "otlp-demo-cluster"; then
    echo "Kind cluster 'otlp-demo-cluster' already exists. Skipping creation."
else
    # Create a kind cluster
    kind create cluster --name otlp-demo-cluster

    # Verify if the kind cluster was created successfully
    if ! kind get clusters | grep -q "otlp-demo-cluster"; then
        echo "Kind cluster was not created successfully. Exiting."
        exit 1
    fi
fi

# Build the Docker image
docker build -t my-node-app .

# Tag the Docker image
docker tag my-node-app:latest jorgepuerta00/my-node-app:latest

# Push the Docker image to Docker Hub
docker push jorgepuerta00/my-node-app:latest

# Load the Docker image into kind cluster
kind load docker-image jorgepuerta00/my-node-app:latest --name otlp-demo-cluster

# Update the deployment with the new image
kubectl set image deployment/otel-dice-deployment dice-otl=jorgepuerta00/my-node-app:latest

# Apply Kubernetes manifests
kubectl apply -f k8s/otlp-configmap.yaml
kubectl apply -f k8s/prom-config.yaml
kubectl apply -f k8s/deploy.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/prom-deploy.yaml

# Check status
kubectl get pods
