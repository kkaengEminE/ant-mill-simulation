# An Inquiry into the Ant Mill Phenomena

> 개미 군집의 죽음의 소용돌이에 관한 생물학적 고찰

![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Vite](https://img.shields.io/badge/Vite-4.x-646CFF)
![License](https://img.shields.io/badge/license-MIT-green)

## 소개

**엔트밀(Ant Mill)** 은 군대개미에게서 관찰되는 '죽음의 소용돌이(Death Spiral)' 현상을 시뮬레이션하는 인터랙티브 프로젝트입니다.

눈이 먼 개미들은 앞선 개미가 남긴 **페로몬**을 추적하며 이동합니다. 우연히 이 경로가 원형 고리를 형성하면, 양의 피드백(Positive Feedback)에 의해 페로몬이 점점 짙어지고 개미들은 탈진할 때까지 원을 그리며 돌게 됩니다.

## 데모

**[Live Demo](https://kkaengEminE.github.io/ant-mill-simulation/)**

## 실험 도구

| 도구 | 설명 |
|------|------|
| 🪨 돌맹이 | 캔버스에 벽(장애물)을 설치합니다 |
| ⛏️ 돌 제거 | 설치된 벽을 제거합니다 |
| 🧪 설탕 | 유인 페로몬을 살포하여 개미를 끌어모읍니다 |
| 💨 흩뿌리기 | 반경 내 개미를 놀라게 하여 소용돌이에서 탈출시킵니다 |
| 💧 물뿌리개 | 해당 영역의 페로몬을 씻어냅니다 |

## 플레이 방법

1. **실험 시작하기**를 클릭하면 개미들이 가장자리에서 서서히 등장합니다.
2. **설탕(🧪)** 도구를 선택하고 캔버스 위에 원형으로 드래그하여 페로몬 경로를 만들어보세요.
3. 개미들이 페로몬을 따라 모여들면서 자연스럽게 **죽음의 소용돌이**가 형성됩니다.
4. 소용돌이에 빠진 개미는 점차 붉은색으로 변하며, 좌측 패널에서 **루프 감염도**를 확인할 수 있습니다.
5. **흩뿌리기(💨)** 나 **물뿌리개(💧)** 로 소용돌이를 해체할 수도 있습니다.

## 기술 스택

- **TypeScript** (Strict Mode) — 외부 라이브러리 없는 순수 구현
- **HTML5 Canvas 2D** — 500마리 개미 + 페로몬 그리드 실시간 렌더링
- **Vite** — 빌드 및 개발 서버

## 핵심 알고리즘

- **조향 벡터(Steering Vector)**: 3방향 센서로 페로몬 농도를 감지하여 이동 방향 결정
- **페로몬 그리드**: 8px 격자 기반 Float32Array로 연산 최적화, 매 프레임 자연 증발
- **엔트밀 감지**: 각속도 누적값(angularHistory)으로 개체의 루프 상태를 실시간 판별

## 아트 스타일

19세기 생물학 서적 / 내츄럴 히스토리 뮤지엄 도감 콘셉트

- 배경: 세피아/바랜 양피지 (#F4EFE6)
- 잉크: 어두운 갈색 (#2C2520)
- 개미: 흑갈색 (#3A302A) → 루프 상태 시 충혈 붉은색 (#A63A3A)

## 로컬 실행

```bash
npm install
npm run dev
# http://localhost:3000 접속
```

## 빌드

```bash
npm run build
npm run preview
```
