# 찾아줘! - 인프라

<p align="center">
  <a href="https://www.finditem.kr/">
    <img src="https://fmi-project-s3-bucket.s3.ap-northeast-2.amazonaws.com/9e619169-f_default-share.png" width="100%" alt="Find My Item Banner" style="border-radius: 12px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);" />
  </a>
</p>

<div align="center">
  <h3><b>서비스 모니터링 | 찾아줘! - 인프라</b></h3>

  <img src="https://img.shields.io/badge/Turborepo-EF4444?style=flat-square&logo=turborepo&logoColor=white" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white" />
</div>

---

## 프로젝트 소개

이 프로젝트는 [찾아줘!](https://www.finditem.kr/) 서비스의 안정적인 운영을 지원하기 위한 모노레포 인프라 레포지토리입니다.

## 기술 스택

- **Task Runner:** `Turborepo 2`
- **Package Manager:** `pnpm 10`
- **Git Hooks:** `Husky`
- **CI/CD:** `GitHub Actions`

## 앱 목록

### `apps/`

| 앱                 | 설명                                     | 바로가기                                |
| :----------------- | :--------------------------------------- | :-------------------------------------- |
| **monitor-server** | 찾아줘! API 상태 점검 및 결과 저장       | [README](apps/monitor-server/README.md) |
| **monitor-web**    | 외부 API 모니터링 데이터 시각화 대시보드 | [README](apps/monitor-web/README.md)    |

### `packages/`

| 패키지     | 설명                               | 바로가기                            |
| :--------- | :--------------------------------- | :---------------------------------- |
| **shared** | 앱 간 공유 TypeScript 타입 및 유틸 | [README](packages/shared/README.md) |

## 프로젝트 구조

```text
infra-support/
├── apps/
│   ├── monitor-server/
│   └── monitor-web/
├── packages/
│   └── shared/
├── .github/
├── turbo.json
└── pnpm-workspace.yaml
```

## 팀원 및 역할

- **[서지권](https://github.com/wlrnjs)**
  - 모노레포 아키텍처 설계 (Turborepo + pnpm workspaces)
  - 외부 API 모니터링 서버 및 대시보드 개발
- **[김준열](https://github.com/junye0l)**
  - 외부 API 모니터링 서버 및 대시보드 개발

## 시작하기

```bash
# 저장소 클론
git clone https://github.com/finditem/infra-support.git
cd infra-support

# 패키지 설치
pnpm install

# 외부 API 모니터링 개발 서버 실행
pnpm dev
```
