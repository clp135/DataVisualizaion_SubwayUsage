import { formatPassengerCount, formatRatio } from '../utils/flowUtils.js';

function FlowRankList({ emptyText, items, label }) {
  return (
    <div className="flow-rank">
      <h3>{label}</h3>
      {items.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <ol>
          {items.map((item) => (
            <li key={item.station}>
              <span>{item.station}</span>
              <strong>{formatPassengerCount(item.passengerCount)}</strong>
              <em>{formatRatio(item.ratio)}</em>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function StationInfoPanel({ selectedStations, summary, onSwapDirection }) {
  if (selectedStations.length === 0) {
    return (
      <section className="panel station-info-panel">
        <p className="eyebrow">Station Detail</p>
        <h2>역을 선택해 주세요</h2>
        <p className="muted">라인맵에서 역 하나를 선택하면 승하차 방향별 상위 OD를 확인할 수 있습니다.</p>
      </section>
    );
  }

  const hasTwoStations = selectedStations.length === 2;

  return (
    <section className="panel station-info-panel">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Station Detail</p>
          <h2>{selectedStations.join(' → ')}</h2>
        </div>
        {hasTwoStations && (
          <button className="ghost-button" type="button" onClick={onSwapDirection}>
            방향 뒤집기
          </button>
        )}
      </div>

      {summary && (
        <>
          {/* 한 역만 선택해도 이 패널은 동작합니다. 두 역 선택 시에는 첫 번째 역의 상세와 방향 제어를 함께 보여줍니다. */}
          <div className="station-total-row">
            <span>승차 합계 {formatPassengerCount(summary.outboundTotal)}</span>
            <span>하차 합계 {formatPassengerCount(summary.inboundTotal)}</span>
          </div>

          <FlowRankList
            emptyText="선택한 필터에서 하차 데이터가 없습니다."
            items={summary.topDestinations}
            label="이 역에서 탄 사람들이 가장 많이 내린 역"
          />
          <FlowRankList
            emptyText="선택한 필터에서 승차 데이터가 없습니다."
            items={summary.topOrigins}
            label="이 역에서 내린 사람들이 가장 많이 탄 역"
          />
        </>
      )}
    </section>
  );
}
