# ArgoCD + GitHub Container Registry 배포 가이드

이 설정은 GitHub Actions에서 빌드한 이미지를 GHCR에 푸시하고, ArgoCD Image Updater가 자동으로 감지하여 배포하는 GitOps 워크플로우입니다.

## 아키텍처 개요

```
GitHub Actions (빌드) 
    ↓
GHCR (이미지 저장)
    ↓
ArgoCD Image Updater (이미지 감지)
    ↓
Git 저장소 업데이트 (이미지 태그)
    ↓
ArgoCD (자동 동기화)
    ↓
Kubernetes (배포)
```

## 사전 요구사항

1. **ArgoCD 설치**
   ```bash
   kubectl create namespace argocd
   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
   ```

2. **ArgoCD Image Updater 설치**
   ```bash
   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml
   ```

3. **GitHub Personal Access Token 생성**
   - GitHub Settings → Developer settings → Personal access tokens
   - `repo` 권한 필요 (Git 저장소에 이미지 태그 업데이트를 커밋하기 위해)
   - ArgoCD Image Updater의 Secret으로 저장

4. **GHCR 접근 권한 설정**
   - GitHub Packages에 대한 읽기 권한 필요
   - Kubernetes 클러스터에서 GHCR 이미지를 Pull할 수 있어야 함

## 설정 단계

### 1. ArgoCD Image Updater Secret 설정

GitHub 토큰을 Secret으로 생성:

```bash
kubectl create secret generic argocd-image-updater-secret \
  --namespace argocd \
  --from-literal=github_token=<YOUR_GITHUB_TOKEN>
```

### 2. ArgoCD Image Updater ConfigMap 설정

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-image-updater-config
  namespace: argocd
data:
  registries.conf: |
    registries:
    - name: GitHub Container Registry
      prefix: ghcr.io
      api_url: https://ghcr.io
      credentials: ext:/auth/ghcr
  git.user: "github-actions[bot]"
  git.email: "github-actions[bot]@users.noreply.github.com"
```

```bash
kubectl apply -f argocd-image-updater-config.yaml
```

### 3. ArgoCD Application 생성

```bash
kubectl apply -f k8s/argocd/application.yaml
```

### 4. GitHub Actions 워크플로우 확인

`.github/workflows/build-and-push.yml`이 다음을 수행합니다:
- 코드 빌드
- Docker 이미지 생성
- GHCR에 푸시 (태그: `main-{sha}`, `latest`)

## 동작 방식

### 1. 이미지 빌드 및 푸시 (GitHub Actions)

`main` 브랜치에 push하면:
1. Next.js 애플리케이션 빌드
2. Docker 이미지 생성
3. GHCR에 푸시:
   - `ghcr.io/portfolio-pages/portfolio-kjs:main-{sha}`
   - `ghcr.io/portfolio-pages/portfolio-kjs:latest`

### 2. 이미지 감지 및 업데이트 (ArgoCD Image Updater)

ArgoCD Image Updater가:
1. GHCR에서 새 이미지 태그 감지 (정기적으로 폴링)
2. `deployment.yaml`의 이미지 태그 업데이트
3. Git 저장소에 변경사항 커밋 및 푸시

### 3. 자동 배포 (ArgoCD)

ArgoCD가:
1. Git 저장소 변경 감지
2. `deployment.yaml`의 새 이미지 태그 적용
3. Kubernetes에 자동 배포

## Deployment 설정 설명

`k8s/deployment.yaml`의 주요 어노테이션:

```yaml
annotations:
  # 감시할 이미지 목록
  argocd-image-updater.argoproj.io/image-list: portfolio-video=ghcr.io/portfolio-pages/portfolio-kjs
  
  # Git에 변경사항을 커밋하는 방법
  argocd-image-updater.argoproj.io/write-back-method: git
  
  # 업데이트할 Git 브랜치
  argocd-image-updater.argoproj.io/git-branch: main
  
  # 업데이트 전략 (latest: 최신 태그 사용)
  argocd-image-updater.argoproj.io/portfolio-video.update-strategy: latest
  
  # 허용할 태그 패턴 (main-로 시작하는 태그만)
  argocd-image-updater.argoproj.io/portfolio-video.allow-tags: regexp:^main-.*$
```

## 업데이트 전략 옵션

### latest (현재 설정)
- 최신 태그를 자동으로 선택
- `allow-tags`로 필터링 가능

### semver
- Semantic Versioning 태그 사용
- 예: `v1.0.0`, `v1.2.3`

### digest
- 특정 이미지 다이제스트 고정

## 모니터링

### ArgoCD Application 상태 확인
```bash
kubectl get application portfolio-video -n argocd
argocd app get portfolio-video
```

### Image Updater 로그 확인
```bash
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-image-updater -f
```

### 배포 상태 확인
```bash
kubectl get pods -l app=portfolio-video
kubectl describe deployment portfolio-video
```

## 트러블슈팅

### 이미지가 업데이트되지 않는 경우

1. **Image Updater 로그 확인**
   ```bash
   kubectl logs -n argocd -l app.kubernetes.io/name=argocd-image-updater
   ```

2. **GitHub 토큰 권한 확인**
   - `repo` 권한이 있는지 확인
   - Secret이 올바르게 설정되었는지 확인

3. **이미지 태그 패턴 확인**
   - `allow-tags` 정규식이 실제 태그와 일치하는지 확인
   - GHCR에 이미지가 실제로 푸시되었는지 확인

### ArgoCD가 동기화하지 않는 경우

1. **Application 상태 확인**
   ```bash
   argocd app get portfolio-video
   ```

2. **수동 동기화**
   ```bash
   argocd app sync portfolio-video
   ```

3. **Git 저장소 접근 권한 확인**
   - ArgoCD가 Git 저장소에 접근할 수 있는지 확인

## 보안 고려사항

1. **GitHub 토큰 보안**
   - Personal Access Token은 최소 권한으로 생성
   - Secret으로 안전하게 저장

2. **GHCR 접근**
   - Kubernetes 클러스터에서 GHCR 이미지를 Pull할 수 있도록 설정
   - ImagePullSecrets 필요 시 설정

3. **이미지 태그 검증**
   - `allow-tags`로 허용된 태그만 사용하도록 제한

