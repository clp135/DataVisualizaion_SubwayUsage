import { formatPassengerCount } from '../utils/flowUtils.js';

const STACK_KEYS = [
  { key: 'direct', label: '선택 출발역 → 선택 도착역', color: '#1d8f58' },
  { key: 'beforeToDestination', label: '선택 출발역 이전 역들 → 선택 도착역', color: '#4f8cc9' },
  { key: 'originToAfter', label: '선택 출발역 → 선택 도착역 이후 역들', color: '#d17b31' },
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

export default function FlowChart({ description, mode, selectedHour, series, title }) {
  const maxValue = getMaxValue(mode, series);

  return (
    <section className="panel chart-panel">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Flow Chart</p>
          <h2>{title}</h2>
        </div>
      </div>
      <p className="chart-description">{description}</p>

      <div className="bar-chart" role="img" aria-label={title}>
        {series.map((item) => {
          const isSelected = item.hour === Number(selectedHour);
          // stacked 모드에서는 세 범주의 합계를 기준으로 선택 시간 tooltip 값을 표시합니다.
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
              {stack.label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
