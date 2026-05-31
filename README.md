# 2호선 유동량 대시보드

서울 지하철 2호선 순환선 OD 통계 데이터를 활용한 React 대시보드 프로토타입입니다.

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버가 실행되면 브라우저에서 안내된 로컬 주소를 열면 됩니다.

## 데이터

- 원본 CSV: 프로젝트 루트의 `지하철_2호선_순환선_OD_통계_202505*.csv`
- 브라우저 로딩용 CSV: `public/data`
- 데이터 컬럼 adapter: `src/lib/dataLoader.js`

원본 컬럼명은 `dataLoader.js`에서만 직접 다루고, 화면과 계산 로직에서는 아래 내부 필드명을 사용합니다.

- `date`
- `originStation`
- `destinationStation`
- `hour`
- `passengerCount`

## 주요 구조

- `src/App.jsx`: 데이터 로드, 필터 상태, 역 선택 상태 관리
- `src/components/FilterPanel.jsx`: 요일/시간/평일/주말/공휴일 필터
- `src/components/LineMap.jsx`: 2호선 본선 가로 라인맵
- `src/components/StationNode.jsx`: 역 노드와 hover 말풍선
- `src/components/TopStations.jsx`: Top 3 역 카드
- `src/components/StationInfoPanel.jsx`: 선택 역 상세 정보
- `src/components/FlowChart.jsx`: 시간대별 그래프
- `src/utils/flowUtils.js`: 유동량 계산 유틸

## 현재 범위

- 2호선 순환선 본선만 표시합니다.
- 성수지선, 신정지선은 이번 프로토타입에서 제외합니다.
- 라인맵 역 순서는 `src/utils/flowUtils.js`의 `LINE_2_MAIN_STATIONS` 배열을 그대로 사용합니다.
- 일부 경로 계산은 프로토타입 fallback이며, 정확한 노선 방향 계산이 필요한 부분은 TODO로 남겨두었습니다.
