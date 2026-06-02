import StationNode from './StationNode.jsx';
export default function LineMap({ stationBriefs, stations, selectedStations, onStationClick, circleTraffic }) {
  const nodeCount = Math.max(stations.length - 1, 1);
  
  // App에서 내려준 데이터 구조 분해 할당
  const { series = [], maxVal = 1 } = circleTraffic || {};

  // 1. SVG용 좌표 문자열 생성 (전체 가로 길이를 1000px로 잡고 비율 계산)
  // 중심축 Y = 60 기준, 내선(inner)은 위로(-), 외선(outer)은 아래로(+) 최대 45px만큼 뻗어나감
  const innerPoints = series.map((d, i) => `${(i / nodeCount) * 1000},${60 - (d.inner / maxVal) * 45}`);
  const outerPoints = series.map((d, i) => `${(i / nodeCount) * 1000},${60 + (d.outer / maxVal) * 45}`);

  const innerLinePath = innerPoints.length ? `M ${innerPoints.join(' L ')}` : '';
  const outerLinePath = outerPoints.length ? `M ${outerPoints.join(' L ')}` : '';

  // 영역 색상 채우기용 패스 (그래프 끝점에서 다시 중심축 Y=60으로 닫아주는 로직)
  const innerAreaPath = innerPoints.length ? `${innerLinePath} L 1000,60 L 0,60 Z` : '';
  const outerAreaPath = outerPoints.length ? `${outerLinePath} L 1000,60 L 0,60 Z` : '';

  return (
    <section className="line-map-section" aria-label="2호선 가로 라인맵">
      <div className="line-map-header">
        <span>Line 2</span>
        <div className="line-flow-legend" aria-label="교통 흐름 범례">
          <span className="flow-legend-item">
            <i className="flow-legend-swatch is-inner" />
            내선 →
          </span>
          <span className="flow-legend-item">
            <i className="flow-legend-swatch is-outer" />
            외선 ←
          </span>
        </div>
        <strong>{selectedStations.length}/2개 역 선택</strong>
      </div>

      <div className="line-map" role="group" aria-label="2호선 역 선택 라인맵">
        
        {/* ✅ 추가: 구간 유동량 꺾은선/영역 그래프 SVG 오버레이 */}
        {series.length > 0 && (
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none', // 역 클릭 마우스 이벤트를 방해하지 않음
              zIndex: 1,
            }}
            viewBox="0 0 1000 126"
            preserveAspectRatio="none" // 반응형 가로 늘림 처리
          >
            {/* 내선 순환: 초록색 계열 은은한 채우기 및 진한 선 */}
            <path d={innerAreaPath} fill="rgba(22, 131, 77, 0.08)" />
            <path d={innerLinePath} fill="none" stroke="#16834d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* 외선 순환: 주황색 계열 은은한 채우기 및 진한 선 */}
            <path d={outerAreaPath} fill="rgba(209, 123, 49, 0.08)" />
            <path d={outerLinePath} fill="none" stroke="#d17b31" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}

        <div className="line-track" style={{ zIndex: 2 }} />
        
        {stations.map((station, index) => (
          <StationNode
            brief={stationBriefs.get(station)}
            index={selectedStations.indexOf(station)}
            isSelected={selectedStations.includes(station)}
            key={`${station}-${index}`}
            station={station}
            x={(index / nodeCount) * 100}
            y={46}
            onClick={onStationClick}
            style={{ zIndex: 3 }} // 노드가 그래프 위로 올라오도록 보장
          />
        ))}
      </div>
    </section>
  );
}
