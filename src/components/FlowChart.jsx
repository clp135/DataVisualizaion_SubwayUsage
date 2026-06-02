import { formatPassengerCount } from '../utils/flowUtils.js';

const STACK_KEYS = [
  { key: 'direct', color: '#1d8f58' },
  { key: 'beforeToDestination', color: '#4f8cc9' },
  { key: 'originToAfter', color: '#d17b31' },
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

  return (
    <section className="panel chart-panel">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Flow Chart</p>
          <h2>{title}</h2>
        </div>
        {onAction && actionLabel && (
          <button className="ghost-button" type="button" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
      <p className="chart-description">{description}</p>

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
              <div className="bar-stack" title={`${item.hour}시 · ${formatPassengerCount(total)}`}>
                {mode === 'stacked' ? (
                  STACK_KEYS.map((stack) => (
                    <span
                      key={stack.key}
                      style={{
                        height: `${(item[stack.key] / maxValue) * 100}%`,
                        background: stack.color,
                      }}
                    />
                  ))
                ) : (
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
