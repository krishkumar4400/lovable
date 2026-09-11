import { k8sCoreV1Api } from "./config.js";

export async function createPod(sandboxId) {
  const podManifest = {
    metadata: {
      name: `sandbox-pod-${sandboxId}`,
      labels: {
        app: `sandbox`,
        sandboxId: sandboxId,
      },
    },
    spec: {
      containers: [
        {
          name: `sandbox-container-${sandboxId}`,
          image: `template:latest`,
          imagePullPolicy: "IfNotPresent",
          ports: [
            {
              containerPort: 5173,
              name: "http",
            },
          ],
          resources: {
            limits: {
              memory: "512Mi",
              cpu: "500m",
            },
            requests: {
              memory: "256Mi",
              cpu: "250m",
            },
          },
        },
      ],
    },
  };

  const response = await k8sCoreV1Api.createNamespacedPod({namespace: "default", body: podManifest});
  return response;
}
