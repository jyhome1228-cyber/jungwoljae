# 정월재 正月齋

> 삶의 흐름을 읽는 곳.

정월재는 사주팔자와 음양오행을 공통 기반으로, 개인의 기질·관계·일·재물·시기의 흐름을 현대적인 언어로 정리하는 명리 해석 서비스입니다.

## Current Setup

- Static HTML / CSS / JavaScript
- Mobile-first responsive layout
- 1040px content container / 1280px marketing header container
- Design Token 기반 CSS 변수 구조
- 키보드 포커스, 스킵 링크, `aria-live`, reduced motion 등 기본 접근성 반영
- 사주 입력 폼 UI 및 기본 입력 검증
- 서비스 소개 / 오행 / 분석 방법 / 정월록 구조

## Brand Direction

- 전통적이되 무속적으로 보이지 않는 현대적 명리 브랜드
- 한자 타이포그래피와 절제된 동양적 그래픽
- 먹색·짙은 브라운·한지 아이보리를 중심으로 한 브랜드 토큰
- 장식보다 여백, 타이포 위계, 정렬, 선과 면의 관계를 우선

## Analysis Architecture

향후 실제 분석은 아래 순서로 연결합니다.

1. 생년월일·출생시간 입력
2. 사주팔자 및 천간·지지 산출
3. 음양오행 구성 분석
4. 일간·십성·합충형파해 분석
5. 대운·세운·월운 계산
6. 정월재 해석 규칙 및 데이터베이스 적용
7. 사용자에게 이해하기 쉬운 언어로 결과 구성

## Service Roadmap

### Phase 1 — MVP
- 나의 사주
- 오행의 균형
- 오늘의 운세
- 상세 사주 결과 화면

### Phase 2
- 월운 / 연운
- 인연·궁합
- 연애 흐름
- 일과 재물

### Phase 3
- 정월록 개인 아카이브
- 계정 / 저장 기능
- 유료 운세서
- 분석 데이터 및 명리 계산 엔진 고도화

## Files

```text
/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Notes

정월재의 콘텐츠는 전통 명리학을 기반으로 한 해석 콘텐츠이며 과학적·의학적·법률적 판단 또는 결과 보장을 목적으로 하지 않습니다.
