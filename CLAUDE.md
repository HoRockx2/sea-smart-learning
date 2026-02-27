# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**세아 똑똑해지는 중** — 초등학생(1~2학년) 맞춤형 학습 플랫폼. Vanilla HTML/CSS/JS 정적 사이트로, 프레임워크 없이 동작한다.

## Dev Server

```bash
python3 -m http.server 8080
# http://localhost:8080 에서 확인
```

`.claude/launch.json`에 프리뷰 서버 설정이 있음 (Python 3.12 경로 지정).

## Deployment

`main` 브랜치 push 시 `.github/workflows/deploy.yml`이 GitHub Pages에 자동 배포한다. 빌드 단계 없이 전체 리포를 그대로 배포.

## Architecture

**허브-스포크 구조**: `index.html`(메인) → `pages/*.html`(상세 페이지들)

- `css/common.css` — 전체 디자인 시스템. CSS 변수 기반 테마, 반응형 브레이크포인트(767px/768px/1025px)
- `js/common.js` — 4개 모듈: TopicLoader(카드 렌더링), CategoryFilter(필터 탭), FeedbackManager(문제 풀이/채점/결과), Utils(셔플, 난이도 별, 카테고리 테마)
- `data/topics.json` — 주제 목록 데이터. 메인 페이지가 fetch하여 카드를 동적 생성
- `pages/*.html` — 각 상세 페이지는 `common.css` + `common.js`를 로드하고, 인라인 `<script>`에서 `initPractice(config)`를 호출하여 문제 데이터를 전달

## 카테고리 컬러 시스템

| 카테고리 | CSS 클래스 | 주 색상 |
|---------|-----------|--------|
| 수학 | `.math` | `--math: #FFC107` (노랑) |
| 음악 | `.music` | `--music: #4CAF50` (초록) |
| 국어 | `.korean` | `--korean: #E91E63` (분홍) |

카테고리별로 `--[cat]`, `--[cat]-bg`, `--[cat]-dark` 3가지 변수가 있다. CSS 클래스명으로 `.math`, `.music`, `.korean`을 사용하면 자동으로 카테고리 색상이 적용된다.

## 새 상세 페이지 추가 방법

1. `data/topics.json`에 항목 추가 (`id`, `title`, `concept`, `story`, `category`, `icon`, `difficulty`, `page`)
2. `pages/[id].html` 생성 — 기존 페이지를 템플릿으로 사용
3. 새 카테고리인 경우 `common.css`의 `:root`에 색상 변수 추가 + 해당 클래스 스타일 추가

## 문제 타입

- `type: "input"` — 직접 입력 (숫자/텍스트). `problem-input` 필드 사용
- `type: "choice"` — 객관식 4지선다. `choices` 배열 필수, `choice-grid` 2열 버튼 레이아웃

## 상세 페이지 필수 DOM ID

`common.js`의 FeedbackManager가 의존하는 요소들:
- `#concept-section` — 개념 섹션 (scrollToConcept 대상)
- `#practice-section` — 연습 문제 섹션
- `#problems-container` — renderProblems가 문제 카드를 삽입하는 컨테이너
- `#progress-fill` / `#progress-count` — 진행률 바
- `#submit-btn` — 정답 확인 버튼
- `#result-section` — showResults가 결과를 삽입하는 컨테이너
- `#retry-buttons` — 다시 풀기/개념 다시 보기 버튼 래퍼

## 기획 문서

`docs/` 폴더에 기획서와 디자인 시안이 보관되어 있다:
- `세아똑똑해지는중_개발기획서.md` — 기술 스펙, JS 모듈 설계, 데이터 구조
- `세아똑똑해지는중_웹페이지_기획서.md` — IA, 페이지 구조, 기능 요구사항
- `design-메인페이지.html` / `design-상세페이지.html` — 디자인 시안 (브라우저에서 열어 확인)
