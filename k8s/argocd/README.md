# ArgoCD 배포 가이드

이 디렉토리에는 ArgoCD를 사용한 GitOps 배포 설정이 포함되어 있습니다.

## 사전 요구사항

1. Kubernetes 클러스터에 ArgoCD 설치
2. Git 저장소에 매니페스트 파일 커밋
3. 로컬에서 빌드한 이미지를 클러스터의 모든 노드에 로드

## 배포 단계

### 1. 로컬 이미지 빌드 및 로드

**모든 노드에 이미지 로드 (필수):**

```bash
# 이미지 빌드
docker build -t portfolio-video:latest .

# 모든 노드에 이미지 로드
./k8s/load-image-to-nodes.sh
```

또는 수동으로:

```bash
# 이미지를 tar 파일로 저장
docker save portfolio-video:latest -o portfolio-video.tar

# 각 노드에 로드
kubectl get nodes
for node in $(kubectl get nodes -o name); do
  kubectl cp portfolio-video.tar ${node#node/}:/tmp/portfolio-video.tar
  kubectl exec ${node#node/} -- docker load -i /tmp/portfolio-video.tar
  kubectl exec ${node#node/} -- rm /tmp/portfolio-video.tar
done
```

### 2. Git 저장소에 매니페스트 커밋

**중요:** ArgoCD가 로컬 이미지를 사용하도록 `deployment.local.yaml`을 사용해야 합니다.

**방법 A: deployment.local.yaml을 기본으로 사용 (권장)**
```bash
# deployment.local.yaml을 deployment.yaml로 복사 (또는 이름 변경)
cp k8s/deployment.local.yaml k8s/deployment.yaml

# Git에 커밋
git add k8s/
git commit -m "Add Kubernetes manifests for ArgoCD with local image"
git push origin main
```

**방법 B: kustomization 사용**
```bash
# kustomization.argocd.yaml 사용 (deployment.local.yaml 참조)
git add k8s/
git commit -m "Add Kubernetes manifests for ArgoCD"
git push origin main

# ArgoCD Application에서 path를 k8s로, kustomize를 활성화
```

### 3. ArgoCD Application 생성

**방법 A: 개별 파일 직접 사용 (가장 간단)**

먼저 `deployment.local.yaml`을 `deployment.yaml`로 복사:
```bash
cp k8s/deployment.local.yaml k8s/deployment.yaml
git add k8s/deployment.yaml
git commit -m "Use local image deployment for ArgoCD"
git push origin main
```

그 다음 ArgoCD Application 생성:
```bash
# application.yaml의 repoURL을 실제 저장소로 수정 후
kubectl apply -f k8s/argocd/application.yaml
```

**방법 B: Kustomize 사용**

```bash
# kustomization.argocd.yaml이 deployment.local.yaml을 참조하도록 설정됨
# application-kustomize.yaml 사용
kubectl apply -f k8s/argocd/application-kustomize.yaml
```

**ArgoCD CLI 사용:**

```bash
# 방법 A (개별 파일)
argocd app create portfolio-video \
  --repo https://github.com/portfolio-pages/portfolio-kjs \
  --path k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default \
  --sync-policy automated \
  --auto-prune \
  --self-heal

# 방법 B (Kustomize)
argocd app create portfolio-video \
  --repo https://github.com/portfolio-pages/portfolio-kjs \
  --path k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default \
  --sync-policy automated \
  --auto-prune \
  --self-heal \
  --kustomize-path k8s
```

### 4. 배포 확인

```bash
# ArgoCD Application 상태 확인
kubectl get application portfolio-video -n argocd
argocd app get portfolio-video

# Pod 상태 확인
kubectl get pods -l app=portfolio-video

# 로그 확인
kubectl logs -f -l app=portfolio-video
```

## 중요 사항

### 이미지 업데이트 시

1. **새 이미지 빌드 및 로드:**
   ```bash
   docker build -t portfolio-video:latest .
   ./k8s/load-image-to-nodes.sh
   ```

2. **매니페스트 업데이트 (필요시):**
   ```bash
   # deployment.local.yaml의 image 태그 변경 (필요한 경우)
   git add k8s/deployment.local.yaml
   git commit -m "Update image tag"
   git push origin main
   ```

3. **ArgoCD가 자동으로 동기화:**
   - `syncPolicy.automated`가 활성화되어 있으면 자동으로 동기화됩니다
   - 수동 동기화가 필요한 경우:
     ```bash
     argocd app sync portfolio-video
     ```

### 로컬 이미지 사용 설정

**핵심 설정:**
- `image: portfolio-video:latest` - 로컬 이미지 이름
- `imagePullPolicy: Never` - 외부 레지스트리에서 Pull하지 않음

이 설정으로 ArgoCD는:
1. 외부 레지스트리에서 이미지를 가져오지 않습니다
2. 클러스터 노드에 이미 로드된 로컬 이미지를 사용합니다
3. 모든 노드에 이미지가 로드되어 있어야 합니다 (1단계 참조)

**중요:** 
- 이미지를 업데이트할 때마다 모든 노드에 다시 로드해야 합니다
- 새 노드가 추가되면 해당 노드에도 이미지를 로드해야 합니다

## 트러블슈팅

### 이미지 Pull 에러

**증상:** `ErrImagePull` 또는 `ImagePullBackOff`

**해결:**
1. 모든 노드에 이미지가 로드되었는지 확인:
   ```bash
   kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}' | xargs -I {} kubectl exec {} -- docker images | grep portfolio-video
   ```

2. 이미지가 없는 노드에 다시 로드:
   ```bash
   ./k8s/load-image-to-nodes.sh
   ```

### ArgoCD 동기화 실패

**증상:** Application이 `Unknown` 또는 `Degraded` 상태

**해결:**
1. ArgoCD 로그 확인:
   ```bash
   kubectl logs -n argocd -l app.kubernetes.io/name=argocd-application-controller
   ```

2. Git 저장소 접근 권한 확인:
   ```bash
   argocd app get portfolio-video
   ```

3. 수동 동기화 시도:
   ```bash
   argocd app sync portfolio-video --force
   ```

## CI/CD 통합 (선택사항)

이미지 빌드와 노드 로드를 자동화하려면:

```yaml
# .github/workflows/build-and-load-image.yml
name: Build and Load Image to Cluster

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-load:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t portfolio-video:latest .
      
      - name: Save image
        run: docker save portfolio-video:latest -o portfolio-video.tar
      
      - name: Load image to cluster nodes
        # 각 노드에 이미지 로드하는 스크립트 실행
        run: |
          # kubectl 설정 및 노드에 이미지 로드
```

