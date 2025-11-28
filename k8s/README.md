# Kubernetes 배포 가이드

이 디렉토리에는 Kubernetes에 포트폴리오 애플리케이션을 배포하기 위한 매니페스트 파일들이 포함되어 있습니다.

## 배포 방식

### ArgoCD + GitHub Container Registry (권장)

GitHub Actions에서 빌드한 이미지를 GHCR에 푸시하고, ArgoCD Image Updater가 자동으로 감지하여 배포합니다.

**상세 가이드:** [k8s/argocd/README.md](argocd/README.md)

## 파일 구조

- `deployment.yaml`: 애플리케이션 배포 설정 (ArgoCD Image Updater 어노테이션 포함)
- `service.yaml`: 클러스터 내부 서비스 노출
- `persistentvolumeclaim.yaml`: 데이터 저장을 위한 PVC
- `configmap.yaml`: 환경 변수 설정
- `argocd/`: ArgoCD 관련 설정 파일

## 빠른 시작

### 1. ArgoCD Image Updater 설정

```bash
# ConfigMap 생성
kubectl apply -f k8s/argocd/image-updater-config.yaml

# Secret 생성 (GitHub 토큰 필요)
kubectl create secret generic argocd-image-updater-secret \
  --namespace argocd \
  --from-literal=github_token=<YOUR_GITHUB_TOKEN>
```

### 2. ArgoCD Application 생성

```bash
# application.yaml의 repoURL을 실제 저장소로 수정 후
kubectl apply -f k8s/argocd/application.yaml
```

### 3. GitHub Actions 워크플로우

`main` 브랜치에 push하면 자동으로:
1. 이미지 빌드 및 GHCR 푸시
2. ArgoCD Image Updater가 새 이미지 감지
3. Git 저장소에 이미지 태그 업데이트
4. ArgoCD가 자동으로 배포

## 설정 변경

### 이미지 레지스트리 변경

`deployment.yaml`의 어노테이션과 이미지 경로 수정:
```yaml
argocd-image-updater.argoproj.io/image-list: portfolio-video=ghcr.io/your-org/your-repo
image: ghcr.io/your-org/your-repo:latest
```

### 리소스 제한 조정

`deployment.yaml`의 `resources` 섹션을 수정하세요.

### 스토리지 크기 조정

`persistentvolumeclaim.yaml`의 `storage` 값을 수정하세요.

## 모니터링

```bash
# Pod 상태 확인
kubectl get pods -l app=portfolio-video

# 로그 확인
kubectl logs -f -l app=portfolio-video

# 서비스 확인
kubectl get svc portfolio-video-service

# ArgoCD Application 상태
kubectl get application portfolio-video -n argocd
argocd app get portfolio-video
```

