<p align="center">
  <a href="https://finditem-monitoring.vercel.app/">
    <img src="https://fmi-project-s3-bucket.s3.ap-northeast-2.amazonaws.com/9e619169-f_default-share.png" width="100%" alt="Find My Item Banner" style="border-radius: 12px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);" />
  </a>
</p>

<div align="center">
  <h3><b>외부 API 모니터링 대시보드 | 찾아줘! - 인프라</b></h3>

  <img src="https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />
</div>

---

## 프로젝트 소개

외부 API가 정상적으로 동작하는지 지속적으로 확인하고, 장애 발생 시 Slack 알림을 통해 즉시 대응하기 위한 모니터링 대시보드입니다. `monitor-server`가 수집한 데이터를 시각화하여 API 상태를 한눈에 파악할 수 있습니다.

## 기술 스택

### **Framework**

- **Framework:** `React 18`
- **Language:** `TypeScript 5`
- **Build Tool:** `Vite`
- **Styling:** `Tailwind CSS`, `clsx`, `tailwind-merge`

### **State & Data**

- **Data Fetching:** `TanStack Query v5`
- **Database:** `Supabase`
- **Routing:** `React Router DOM v6`

### **UI**

- **Chart:** `Recharts`
- **Date:** `date-fns`

## 프로젝트 구조

```text
src/
├── components/   # 공통 UI 컴포넌트
├── layouts/      # 레이아웃 컴포넌트
├── pages/        # 페이지 컴포넌트
├── queries/      # TanStack Query 훅
├── hooks/        # 커스텀 훅
├── types/        # 타입 정의
└── utils/        # 유틸리티 함수
```

## 시작하기

```bash
# 루트에서 실행 (권장)
pnpm dev

# 개별 실행
cd apps/monitor-web
pnpm dev
```
