import { WEEKDAY_LABELS } from '../utils/flowUtils.js';

const DAY_TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'weekday', label: '평일' },
  { value: 'weekend', label: '주말' },
  { value: 'holiday', label: '공휴일' },
];

export default function FilterPanel({ filters, onChange }) {
  function updateFilters(partialFilters) {
    onChange((current) => ({ ...current, ...partialFilters }));
  }

  function selectDayType(dayType) {
    // 평일/주말 버튼을 누를 때 요일 칩도 같이 맞춰야 빈 데이터 화면을 덜 보게 됩니다.
    const dayPresets = {
      all: [1, 2, 3, 4, 5, 6, 0],
      weekday: [1, 2, 3, 4, 5],
      weekend: [6, 0],
      holiday: [1, 2, 3, 4, 5, 6, 0],
    };

    updateFilters({
      dayType,
      selectedDays: dayPresets[dayType],
      includeHolidays: dayType === 'holiday' ? true : filters.includeHolidays,
    });
  }

  function toggleDay(dayValue) {
    const nextDays = filters.selectedDays.includes(dayValue)
      ? filters.selectedDays.filter((value) => value !== dayValue)
      : [...filters.selectedDays, dayValue];

    updateFilters({ selectedDays: nextDays });
  }

  return (
    <section className="filter-panel" aria-label="데이터 필터">
      <div className="filter-group">
        <span className="filter-label">요일</span>
        <div className="chip-row">
          {WEEKDAY_LABELS.map((day) => (
            <button
              className={`chip ${filters.selectedDays.includes(day.value) ? 'is-active' : ''}`}
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">구분</span>
        <div className="segmented-control">
          {DAY_TYPE_OPTIONS.map((option) => (
            <button
              className={filters.dayType === option.value ? 'is-active' : ''}
              key={option.value}
              type="button"
              onClick={() => selectDayType(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <label className="holiday-toggle">
        <input
          checked={filters.includeHolidays}
          type="checkbox"
          onChange={(event) => updateFilters({ includeHolidays: event.target.checked })}
        />
        공휴일 포함
      </label>

      <label className="hour-filter">
        <span className="filter-label">시간</span>
        <select
          value={filters.hour}
          onChange={(event) => updateFilters({ hour: Number(event.target.value) })}
        >
          {Array.from({ length: 24 }, (_, hour) => (
            <option key={hour} value={hour}>
              {String(hour).padStart(2, '0')}시
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
