# Kubernetes 배포 가이드

이 디렉토리에는 Kubernetes에 포트폴리오 애플리케이션을 배포하기 위한 매니페스트 파일들이 포함되어 있습니다.

## 파일 구조

- `deployment.yaml`: 애플리케이션 배포 설정
- `service.yaml`: 클러스터 내부 서비스 노출
- `persistentvolumeclaim.yaml`: 데이터 저장을 위한 PVC
- `ingress.yaml`: 외부 접근을 위한 Ingress 설정
- `configmap.yaml`: 환경 변수 설정

## 배포 방법

### ArgoCD 사용 (GitOps)

ArgoCD를 사용한 배포는 [k8s/argocd/README.md](argocd/README.md)를 참조하세요.

**빠른 시작:**
```bash
# 1. 로컬 이미지 빌드 및 모든 노드에 로드
chmod +x k8s/argocd/prepare-local-image.sh
./k8s/argocd/prepare-local-image.sh

# 2. Git에 커밋 및 푸시
git add k8s/
git commit -m "Add manifests"
git push origin main

# 3. ArgoCD Application 생성
kubectl apply -f k8s/argocd/application.yaml
```

### 방법 1: 원격 레지스트리 사용 (프로덕션)

1. **Docker 이미지 빌드 및 푸시**
   ```bash
   docker build -t portfolio-video:latest .
   docker tag portfolio-video:latest <registry>/portfolio-video:latest
   docker push <registry>/portfolio-video:latest
   ```

2. **Kubernetes 리소스 배포**
   ```bash
   kubectl apply -f k8s/persistentvolumeclaim.yaml
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   kubectl apply -f k8s/ingress.yaml  # 선택사항
   ```

### 방법 2: 로컬 이미지 사용 (개발/테스트)

**원격 저장소 없이 로컬에서 빌드한 이미지를 직접 사용할 수 있습니다!**

#### 자동 배포 스크립트 사용 (권장)

```bash
chmod +x k8s/deploy-local.sh
./k8s/deploy-local.sh
```

이 스크립트는 다음을 자동으로 처리합니다:
- Docker 이미지 빌드
- 클러스터 타입 감지 (kind/minikube/일반 k8s)
- 이미지를 클러스터에 로드
- 모든 Kubernetes 리소스 배포

#### 수동 배포

**kind 클러스터:**
```bash
# 1. 이미지 빌드
docker build -t portfolio-video:latest .

# 2. kind에 이미지 로드
kind load docker-image portfolio-video:latest

# 3. 배포
kubectl apply -f k8s/persistentvolumeclaim.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.local.yaml
kubectl apply -f k8s/service.yaml
```

**minikube 클러스터:**
```bash
# 1. minikube의 Docker 환경 사용
eval $(minikube -p minikube docker-env)

# 2. 이미지 빌드 (minikube의 Docker 데몬에 직접 빌드)
docker build -t portfolio-video:latest .

# 3. 원래 Docker 환경으로 복귀
eval $(minikube -p minikube docker-env -u)

# 4. 배포
kubectl apply -f k8s/persistentvolumeclaim.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.local.yaml
kubectl apply -f k8s/service.yaml
```

**일반 Kubernetes 클러스터 (모든 노드에 이미지 로드 필요):**
```bash
# 1. 이미지 빌드
docker build -t portfolio-video:latest .

# 2. 모든 노드에 이미지 로드
chmod +x k8s/load-image-to-nodes.sh
./k8s/load-image-to-nodes.sh

# 또는 수동으로:
docker save portfolio-video:latest -o portfolio-video.tar
# 각 노드에서:
# docker load -i portfolio-video.tar

# 3. 배포
kubectl apply -f k8s/persistentvolumeclaim.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.local.yaml
kubectl apply -f k8s/service.yaml
```

**중요:** 로컬 이미지 사용 시 `deployment.local.yaml`을 사용하세요. 이 파일은 `imagePullPolicy: Never`로 설정되어 있어 원격 레지스트리에서 이미지를 가져오지 않습니다.

### Kustomize 사용

**로컬 이미지 사용:**
```bash
kubectl apply -k k8s/kustomization.local.yaml
```

**원격 레지스트리 사용:**
1. `kustomization.yaml`의 `images` 섹션 주석을 해제하고 실제 레지스트리 주소로 변경
2. `kubectl apply -k k8s/`

## 설정 변경

### 이미지 태그 변경

**직접 배포 시:**
`deployment.yaml`의 `image` 필드를 수정하세요:
```yaml
image: your-registry.com/portfolio-video:tag
```

**Kustomize 사용 시:**
`kustomization.yaml`의 `images` 섹션을 수정하세요:
```yaml
images:
  - name: portfolio-video
    newName: your-registry.com/portfolio-video
    newTag: tag
```

### 리소스 제한 조정
`deployment.yaml`의 `resources` 섹션을 수정하세요.

### 스토리지 크기 조정
`persistentvolumeclaim.yaml`의 `storage` 값을 수정하세요.

### 도메인 설정
`ingress.yaml`의 `host` 필드를 실제 도메인으로 변경하세요.

## 데이터 마이그레이션

초기 데이터를 PVC에 복사하려면:

```bash
# Pod 이름 확인
kubectl get pods -l app=portfolio-video

# 데이터 복사
kubectl cp data/ <pod-name>:/app/data/
kubectl cp public/videos/ <pod-name>:/app/public/videos/
kubectl cp public/images/ <pod-name>:/app/public/images/
kubectl cp public/profile/ <pod-name>:/app/public/profile/
```

## 모니터링

```bash
# Pod 상태 확인
kubectl get pods -l app=portfolio-video

# 로그 확인
kubectl logs -f -l app=portfolio-video

# 서비스 확인
kubectl get svc portfolio-video-service

# Ingress 확인
kubectl get ingress portfolio-video-ingress
```

## 트러블슈팅

### Pod가 시작되지 않는 경우
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### PVC가 바인딩되지 않는 경우
```bash
kubectl get pvc
kubectl describe pvc <pvc-name>
```

### 이미지 Pull 실패
- 이미지 레지스트리 접근 권한 확인
- `imagePullSecrets` 설정 필요시 추가

