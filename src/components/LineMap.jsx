import StationNode from './StationNode.jsx';

export default function LineMap({ stationBriefs, stations, selectedStations, onStationClick }) {
  const nodeCount = Math.max(stations.length - 1, 1);

  return (
    <section className="line-map-section" aria-label="2호선 가로 라인맵">
      <div className="line-map-header">
        <span>Line 2</span>
        <strong>{selectedStations.length}/2개 역 선택</strong>
      </div>

      <div className="line-map" role="group" aria-label="2호선 역 선택 라인맵">
        <div className="line-track" />
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
          />
        ))}
      </div>
    </section>
  );
}
