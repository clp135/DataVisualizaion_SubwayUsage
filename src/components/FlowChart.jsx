import { formatPassengerCount } from '../utils/flowUtils.js';

const STACK_KEYS = [
  { key: 'direct', color: '#1d8f58' },
  { key: 'beforeToDestination', color: '#d17b31' },
  { key: 'originToAfter', color: '#4f8cc9' },
];

function getMaxValue(mode, series) {
  if (mode === 'stacked') {
    return Math.max(
      1,
      ...series.map((item) => item.direct + item.beforeToDestination + item.originToAfter),
    );
  }

  return Math.max(1, ...series.map((item) => item.total));
}

function formatAxisValue(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
  }

  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }

  return String(Math.round(value));
}

export default function FlowChart({
  actionLabel,
  description,
  mode,
  onAction,
  selectedHour,
  series,
  stackLabels = {},
  title,
}) {
  const maxValue = getMaxValue(mode, series);
  const axisTicks = [maxValue, maxValue / 2, 0];

  return (
    <section className="panel chart-panel">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Chart</p>
          <h2>{title}</h2>
        </div>
        {onAction && actionLabel && (
          <button className="ghost-button" type="button" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
      <p className="chart-description">{description}</p>

      <div className="bar-chart-frame">
        <div className="chart-y-axis" aria-hidden="true">
          {axisTicks.map((tick) => (
            <span key={tick}>{formatAxisValue(tick)}</span>
          ))}
        </div>

        <div className="bar-chart" role="img" aria-label={title}>
          {series.map((item) => {
            const isSelected = item.hour === Number(selectedHour);
            const total =
              mode === 'stacked'
                ? item.direct + item.beforeToDestination + item.originToAfter
                : item.total;

            return (
              <div className={`bar-column ${isSelected ? 'is-selected' : ''}`} key={item.hour}>
                <div className="bar-value">{isSelected ? formatPassengerCount(total) : ''}</div>
                <div className="bar-stack" title={`Total: ${formatPassengerCount(total)}\n` +
                  `• Direct: ${formatPassengerCount(item.direct)}\n` +
                  `• Before Origin: ${formatPassengerCount(item.beforeToDestination)}\n` +
                  `• After Destination: ${formatPassengerCount(item.originToAfter)}`}>
                  {mode === 'stacked' ? (
                    STACK_KEYS.toReversed().map((stack) => (
                      item[stack.key] === 0 ? null :
                      (
                        <span
                          key={stack.key}
                          style={{
                            height: `${(item[stack.key] / maxValue) * 100}%`,
                            background: stack.color,
                          }}
                        />
                      )
                    ))
                  ) : (
                    item.total === 0 ? null :
                    <span
                      style={{
                        height: `${(item.total / maxValue) * 100}%`,
                        background: '#1d8f58',
                      }}
                    />
                  )}
                </div>
                <span className="bar-label">{item.hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {mode === 'stacked' && (
        <div className="legend-row">
          {STACK_KEYS.map((stack) => (
            <span key={stack.key}>
              <i style={{ background: stack.color }} />
              {stackLabels[stack.key]}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
