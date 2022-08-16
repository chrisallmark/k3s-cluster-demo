# k3s-cluster-demo

This is a demo project used to test out your k3s cluster. It's a simple React client with a server API that just returns the hostname of the server for display.

To deploy the application to the cluster we'll use [Skaffold](https://skaffold.dev/) which you can install via brew with:

```
brew install skaffold
```

By default (if you haven't set up a private registry) your images will be pushed/pulled to/from [Docker Hub](https://hub.docker.com/) so you'll need to configure the infra scripts with your Docker Hub ID with:

```
./configure.sh <docker hub username>
```

Check you are connected are connected to your cluster with:

```
kubectl get nodes
```

...and depoy with:

```
skaffold dev
```
