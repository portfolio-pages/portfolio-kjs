#!/bin/bash

# 일반 Kubernetes 클러스터의 모든 노드에 이미지를 로드하는 스크립트

set -e

IMAGE_NAME="portfolio-video"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"
TAR_FILE="${IMAGE_NAME}.tar"

echo "🚀 노드에 이미지 로드 시작..."

# 1. 이미지가 없으면 빌드
if ! docker images | grep -q "${IMAGE_NAME}.*${IMAGE_TAG}"; then
    echo "📦 Docker 이미지 빌드 중..."
    docker build -t ${FULL_IMAGE_NAME} .
fi

# 2. 이미지를 tar 파일로 저장
echo "📦 이미지를 tar 파일로 저장 중..."
docker save ${FULL_IMAGE_NAME} -o ${TAR_FILE}

# 3. 모든 노드 가져오기
NODES=$(kubectl get nodes -o jsonpath='{.items[*].metadata.name}')

if [ -z "$NODES" ]; then
    echo "❌ 노드를 찾을 수 없습니다"
    exit 1
fi

echo "🔍 발견된 노드: $NODES"
echo ""

# 4. 각 노드에 이미지 로드
for NODE in $NODES; do
    echo "📤 노드 ${NODE}에 이미지 로드 중..."
    
    # tar 파일을 노드로 복사
    kubectl cp ${TAR_FILE} ${NODE}:/tmp/${TAR_FILE}
    
    # 노드에서 이미지 로드
    kubectl exec ${NODE} -- docker load -i /tmp/${TAR_FILE}
    
    # 임시 파일 삭제
    kubectl exec ${NODE} -- rm /tmp/${TAR_FILE}
    
    echo "✅ ${NODE} 완료"
done

# 5. 로컬 tar 파일 삭제
rm -f ${TAR_FILE}

echo ""
echo "✅ 모든 노드에 이미지 로드 완료!"

