import { formatPassengerCount } from '../utils/flowUtils.js';

function StationRelation({ label, relation }) {
  return (
    <p className="top-station-relation">
      <span>{label}</span>
      <strong>{relation?.station ?? '-'}</strong>
      <em>{relation ? formatPassengerCount(relation.passengerCount) : '-'}</em>
    </p>
  );
}

export default function TopStations({ stations }) {
  return (
    <section className="panel top-stations-panel">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Top 3</p>
          <h2>Busiest Stations by Passenger Volume</h2>
        </div>
      </div>

      <ol className="top-station-list">
        {stations.map((station) => (
          <li key={station.station}>
            <div className="top-station-head">
              <strong>{station.rank}</strong>
              <div>
                <span>{station.station}</span>
                <em>{formatPassengerCount(station.passengerCount)}</em>
              </div>
            </div>
            <StationRelation label="Top origin" relation={station.topOrigin} />
            <StationRelation label="Top destination" relation={station.topDestination} />
          </li>
        ))}
      </ol>
    </section>
  );
}
