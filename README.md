This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

비디오 포트폴리오 스트리밍 서비스입니다. 로컬 비디오 파일을 스트리밍하는 기능을 제공합니다.

## Getting Started

### 설치

```bash
yarn install
```

### 개발 서버 실행

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 프로젝트 구조

이 프로젝트는 **기능 중심 아키텍처(Feature-based Architecture)**를 따릅니다.

```
portfolio-video/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   └── page.tsx
├── features/               # 기능별 모듈
│   ├── video/             # 비디오 관련 기능
│   │   ├── components/    # 비디오 컴포넌트
│   │   ├── hooks/        # 비디오 훅
│   │   ├── utils/        # 비디오 유틸리티
│   │   └── types.ts      # 비디오 타입 정의
│   └── portfolio/        # 포트폴리오 관련 기능
│       ├── components/   # 포트폴리오 컴포넌트
│       ├── hooks/        # 포트폴리오 훅
│       ├── utils/        # 포트폴리오 유틸리티
│       └── types.ts      # 포트폴리오 타입 정의
├── shared/                # 공통 모듈
│   ├── components/       # 공통 컴포넌트
│   ├── hooks/            # 공통 훅
│   ├── lib/              # 유틸리티 함수
│   └── types/            # 공통 타입
└── public/               # 정적 파일
```

### 아키텍처 원칙

- **기능 중심 구조**: 각 기능(video, portfolio)은 독립적인 폴더에 모든 관련 코드를 포함합니다.
- **공통 모듈 분리**: 여러 기능에서 사용되는 코드는 `shared/` 폴더에 배치합니다.
- **타입 안정성**: 각 기능과 공통 모듈에 TypeScript 타입을 정의합니다.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
