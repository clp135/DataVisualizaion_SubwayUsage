import { formatPassengerCount } from '../utils/flowUtils.js';

export default function StationNode({ brief, index, isSelected, station, x, y, onClick }) {
  const outboundTotal = brief?.outboundTotal ?? 0;
  const inboundTotal = brief?.inboundTotal ?? 0;

  return (
    <button
      className={`station-node ${isSelected ? 'is-selected' : ''}`}
      style={{ left: `${x}%`, top: `${y}px` }}
      type="button"
      onClick={() => onClick(station)}
    >
      <span className="station-dot" />
      <span className="station-name">{station}</span>
      {isSelected && <span className="station-order">{index + 1}</span>}

      <span className="station-tooltip" role="tooltip">
        <strong>{station}</strong>
        <span>승차 {formatPassengerCount(outboundTotal)}</span>
        <span>하차 {formatPassengerCount(inboundTotal)}</span>
      </span>
    </button>
  );
}
