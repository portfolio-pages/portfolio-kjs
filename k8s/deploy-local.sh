#!/bin/bash

# 로컬 이미지를 Kubernetes에 배포하는 스크립트

set -e

IMAGE_NAME="portfolio-video"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo "🚀 로컬 이미지 배포 시작..."

# 1. Docker 이미지 빌드
echo "📦 Docker 이미지 빌드 중..."
docker build -t ${FULL_IMAGE_NAME} .

# Kubernetes 클러스터 타입 확인
if command -v kubectl &> /dev/null; then
    CLUSTER_TYPE=$(kubectl config current-context 2>/dev/null || echo "unknown")
    
    # kind 클러스터인 경우
    if [[ "$CLUSTER_TYPE" == *"kind"* ]] || [[ "$CLUSTER_TYPE" == "kind-"* ]]; then
        echo "🔍 kind 클러스터 감지됨"
        echo "📤 kind에 이미지 로드 중..."
        kind load docker-image ${FULL_IMAGE_NAME} --name $(kubectl config current-context | sed 's/kind-//')
    
    # minikube 클러스터인 경우
    elif command -v minikube &> /dev/null && minikube status &> /dev/null; then
        echo "🔍 minikube 클러스터 감지됨"
        echo "📤 minikube에 이미지 로드 중..."
        eval $(minikube -p minikube docker-env)
        docker build -t ${FULL_IMAGE_NAME} .
        eval $(minikube -p minikube docker-env -u)
    
    # 일반 Kubernetes 클러스터인 경우
    else
        echo "⚠️  일반 Kubernetes 클러스터 감지됨"
        echo "📦 이미지를 tar 파일로 저장 중..."
        docker save ${FULL_IMAGE_NAME} -o ${IMAGE_NAME}.tar
        
        echo "📤 각 노드에 이미지 로드 필요:"
        echo "   kubectl get nodes"
        echo "   각 노드에서 다음 명령 실행:"
        echo "   docker load -i ${IMAGE_NAME}.tar"
        echo ""
        echo "또는 다음 스크립트를 사용하세요:"
        echo "   ./k8s/load-image-to-nodes.sh"
        
        read -p "계속하시겠습니까? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    echo "❌ kubectl을 찾을 수 없습니다"
    exit 1
fi

# 2. PVC 생성
echo "💾 PersistentVolumeClaim 생성 중..."
kubectl apply -f k8s/persistentvolumeclaim.yaml

# 3. ConfigMap 생성
echo "⚙️  ConfigMap 생성 중..."
kubectl apply -f k8s/configmap.yaml

# 4. Deployment 배포
echo "🚀 Deployment 배포 중..."
kubectl apply -f k8s/deployment.local.yaml

# 5. Service 생성
echo "🌐 Service 생성 중..."
kubectl apply -f k8s/service.yaml

# 6. 배포 상태 확인
echo "⏳ 배포 상태 확인 중..."
kubectl rollout status deployment/portfolio-video --timeout=300s

echo "✅ 배포 완료!"
echo ""
echo "📊 상태 확인:"
kubectl get pods -l app=portfolio-video
kubectl get svc portfolio-video-service

