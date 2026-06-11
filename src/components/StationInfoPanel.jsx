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
        <h2>Select a Station</h2>
        <p className="muted">Select a station from the line map to view top OD patterns by direction.</p>
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
            Reverse Direction
          </button>
        )}
      </div>

      {summary && (
        <>
          {/* 한 역만 선택해도 이 패널은 동작합니다. 두 역 선택 시에는 첫 번째 역의 상세와 방향 제어를 함께 보여줍니다. */}
          <div className="station-total-row">
            <span>Boarding {formatPassengerCount(summary.outboundTotal)}</span>
            <span>Alighting {formatPassengerCount(summary.inboundTotal)}</span>
          </div>

          <FlowRankList
            emptyText="No alighting data available for the selected filters."
            items={summary.topDestinations}
            label="Top Destinations from this Station"
          />
          <FlowRankList
            emptyText="No boarding data available for the selected filters."
            items={summary.topOrigins}
            label="Top Origins for this Station"
          />
        </>
      )}
    </section>
  );
}
