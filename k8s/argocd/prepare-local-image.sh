#!/bin/bash

# ArgoCD 배포를 위한 로컬 이미지 준비 스크립트

set -e

IMAGE_NAME="portfolio-video"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo "🚀 ArgoCD 배포를 위한 로컬 이미지 준비 시작..."

# 1. Docker 이미지 빌드
echo "📦 Docker 이미지 빌드 중..."
docker build -t ${FULL_IMAGE_NAME} .

# 2. 모든 노드에 이미지 로드
echo "📤 모든 노드에 이미지 로드 중..."
./k8s/load-image-to-nodes.sh

# 3. 이미지 로드 확인
echo "✅ 이미지 로드 확인 중..."
NODES=$(kubectl get nodes -o jsonpath='{.items[*].metadata.name}')

for NODE in $NODES; do
    if kubectl exec ${NODE} -- docker images | grep -q "${IMAGE_NAME}.*${IMAGE_TAG}"; then
        echo "  ✓ ${NODE}: 이미지 확인됨"
    else
        echo "  ✗ ${NODE}: 이미지 없음 - 다시 로드 필요"
        exit 1
    fi
done

echo ""
echo "✅ 모든 노드에 이미지가 준비되었습니다!"
echo ""
echo "다음 단계:"
echo "1. Git 저장소에 매니페스트 커밋 및 푸시"
echo "2. ArgoCD Application 생성: kubectl apply -f k8s/argocd/application.yaml"
echo "3. 배포 상태 확인: kubectl get application portfolio-video -n argocd"

