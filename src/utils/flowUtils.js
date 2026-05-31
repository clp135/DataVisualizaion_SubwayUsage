export const WEEKDAY_LABELS = [
  { value: 1, label: '월' },
  { value: 2, label: '화' },
  { value: 3, label: '수' },
  { value: 4, label: '목' },
  { value: 5, label: '금' },
  { value: 6, label: '토' },
  { value: 0, label: '일' },
];

// 2호선 순환선 본선 순서입니다.
// 사용자가 지정한 배열을 그대로 사용하며, 성수지선/신정지선은 이번 프로토타입에서 제외합니다.
export const LINE_2_MAIN_STATIONS = [
  '신촌',
  '이대',
  '아현',
  '충정로',
  '시청',
  '을지로입구',
  '을지로3가',
  '을지로4가',
  '동대문역사문화공원',
  '신당',
  '상왕십리',
  '왕십리',
  '한양대',
  '뚝섬',
  '성수',
  '건대입구',
  '구의',
  '강변',
  '잠실나루',
  '잠실',
  '잠실새내',
  '종합운동장',
  '삼성',
  '선릉',
  '역삼',
  '강남',
  '교대',
  '서초',
  '방배',
  '사당',
  '낙성대',
  '서울대입구',
  '봉천',
  '신림',
  '신대방',
  '구로디지털단지',
  '대림',
  '신도림',
  '문래',
  '영등포구청',
  '당산',
  '합정',
  '홍대입구',
  '신촌',
];

// 계산용 배열은 중복된 마지막 신촌만 제외합니다. 화면용 라인맵은 LINE_2_MAIN_STATIONS를 그대로 씁니다.
export const LINE_2_STATION_ORDER = LINE_2_MAIN_STATIONS.slice(0, -1);

// 2025년 5월 데이터용 임시 공휴일 목록입니다.
// TODO: 공휴일 API 또는 별도 달력 데이터로 교체하면 연도/월 변경에도 안전합니다.
const FALLBACK_HOLIDAYS = new Set(['20250505', '20250506']);

const numberFormatter = new Intl.NumberFormat('ko-KR');

function getDayOfWeek(dateText) {
  const year = Number(dateText.slice(0, 4));
  const month = Number(dateText.slice(4, 6)) - 1;
  const day = Number(dateText.slice(6, 8));
  return new Date(year, month, day).getDay();
}

function isWeekend(dateText) {
  const day = getDayOfWeek(dateText);
  return day === 0 || day === 6;
}

function passesDayType(row, filters) {
  if (filters.includeHolidays && FALLBACK_HOLIDAYS.has(row.date)) {
    return true;
  }

  if (filters.dayType === 'weekday') {
    return !isWeekend(row.date) && !FALLBACK_HOLIDAYS.has(row.date);
  }

  if (filters.dayType === 'weekend') {
    return isWeekend(row.date);
  }

  if (filters.dayType === 'holiday') {
    return FALLBACK_HOLIDAYS.has(row.date);
  }

  return true;
}

function passesSelectedDays(row, filters) {
  if (!filters.selectedDays?.length) {
    return true;
  }

  return filters.selectedDays.includes(getDayOfWeek(row.date));
}

export function filterRows(rows, filters, options = { includeHour: true }) {
  return rows.filter((row) => {
    const hourMatches = !options.includeHour || row.hour === Number(filters.hour);
    return hourMatches && passesDayType(row, filters) && passesSelectedDays(row, filters);
  });
}

export function buildStationList(rows) {
  // 라인맵과 경로 계산 순서를 보호하기 위해 데이터에 있는 다른 역을 삽입하지 않습니다.
  return LINE_2_STATION_ORDER;
}

export function buildLineMapStationList(stations) {
  // stations 인자는 기존 호출부 호환성을 위해 남겨두지만, 화면에는 지정된 본선 배열을 그대로 사용합니다.
  return LINE_2_MAIN_STATIONS;
}

function addToMap(map, key, value) {
  map.set(key, (map.get(key) ?? 0) + value);
}

function toSortedEntries(map, total) {
  return [...map.entries()]
    .map(([station, passengerCount]) => ({
      station,
      passengerCount,
      ratio: total > 0 ? passengerCount / total : 0,
    }))
    .sort((a, b) => b.passengerCount - a.passengerCount);
}

function firstEntry(map, total) {
  return toSortedEntries(map, total).at(0) ?? null;
}

export function getTopStations(rows, limit = 3) {
  const stationStats = new Map();

  function ensureStats(stationName) {
    if (!stationStats.has(stationName)) {
      stationStats.set(stationName, {
        station: stationName,
        passengerCount: 0,
        inboundTotal: 0,
        outboundTotal: 0,
        origins: new Map(),
        destinations: new Map(),
      });
    }

    return stationStats.get(stationName);
  }

  for (const row of rows) {
    const originStats = ensureStats(row.originStation);
    const destinationStats = ensureStats(row.destinationStation);

    originStats.passengerCount += row.passengerCount;
    originStats.outboundTotal += row.passengerCount;
    destinationStats.inboundTotal += row.passengerCount;

    addToMap(originStats.destinations, row.destinationStation, row.passengerCount);
    addToMap(destinationStats.origins, row.originStation, row.passengerCount);
  }

  return [...stationStats.values()]
    .sort((a, b) => b.passengerCount - a.passengerCount)
    .slice(0, limit)
    .map((station, index) => ({
      rank: index + 1,
      station: station.station,
      passengerCount: station.passengerCount,
      topOrigin: firstEntry(station.origins, station.inboundTotal),
      topDestination: firstEntry(station.destinations, station.outboundTotal),
    }));
}

export function getStationBriefMap(rows) {
  const stationBriefs = new Map();

  function ensureBrief(stationName) {
    if (!stationBriefs.has(stationName)) {
      stationBriefs.set(stationName, {
        stationName,
        outboundTotal: 0,
        inboundTotal: 0,
      });
    }

    return stationBriefs.get(stationName);
  }

  for (const row of rows) {
    ensureBrief(row.originStation).outboundTotal += row.passengerCount;
    ensureBrief(row.destinationStation).inboundTotal += row.passengerCount;
  }

  return stationBriefs;
}

export function getStationFlowSummary(rows, stationName) {
  if (!stationName) {
    return null;
  }

  const destinations = new Map();
  const origins = new Map();
  let outboundTotal = 0;
  let inboundTotal = 0;

  for (const row of rows) {
    if (row.originStation === stationName) {
      outboundTotal += row.passengerCount;
      addToMap(destinations, row.destinationStation, row.passengerCount);
    }

    if (row.destinationStation === stationName) {
      inboundTotal += row.passengerCount;
      addToMap(origins, row.originStation, row.passengerCount);
    }
  }

  return {
    stationName,
    outboundTotal,
    inboundTotal,
    topDestinations: toSortedEntries(destinations, outboundTotal).slice(0, 5),
    topOrigins: toSortedEntries(origins, inboundTotal).slice(0, 5),
  };
}

export function getHourlyFlowSeries(rows, filters) {
  const hourlyTotals = new Map(Array.from({ length: 24 }, (_, hour) => [hour, 0]));
  const rowsWithoutHourFilter = filterRows(rows, filters, { includeHour: false });

  for (const row of rowsWithoutHourFilter) {
    addToMap(hourlyTotals, row.hour, row.passengerCount);
  }

  return [...hourlyTotals.entries()].map(([hour, passengerCount]) => ({
    hour,
    total: passengerCount,
  }));
}

function getStationSlice(stations, startStation, endStation, mode) {
  const startIndex = stations.indexOf(startStation);
  const endIndex = stations.indexOf(endStation);

  if (startIndex === -1 || endIndex === -1) {
    return [];
  }

  // TODO: 순환선의 양방향 최단 경로가 아니라 배열상 직선 순서 기반의 프로토타입 계산입니다.
  if (mode === 'beforeOrigin') {
    return stations.slice(0, startIndex);
  }

  if (mode === 'afterDestination') {
    return stations.slice(endIndex + 1);
  }

  return [];
}

export function getTwoStationStackedSeries({
  rows,
  filters,
  stations,
  originStation,
  destinationStation,
}) {
  if (!originStation || !destinationStation) {
    return [];
  }

  const beforeOriginStations = new Set(
    getStationSlice(stations, originStation, destinationStation, 'beforeOrigin'),
  );
  const afterDestinationStations = new Set(
    getStationSlice(stations, originStation, destinationStation, 'afterDestination'),
  );
  const rowsWithoutHourFilter = filterRows(rows, filters, { includeHour: false });
  const byHour = new Map(
    Array.from({ length: 24 }, (_, hour) => [
      hour,
      { hour, direct: 0, beforeToDestination: 0, originToAfter: 0 },
    ]),
  );

  for (const row of rowsWithoutHourFilter) {
    const bucket = byHour.get(row.hour);

    if (row.originStation === originStation && row.destinationStation === destinationStation) {
      bucket.direct += row.passengerCount;
    }

    if (beforeOriginStations.has(row.originStation) && row.destinationStation === destinationStation) {
      bucket.beforeToDestination += row.passengerCount;
    }

    if (row.originStation === originStation && afterDestinationStations.has(row.destinationStation)) {
      bucket.originToAfter += row.passengerCount;
    }
  }

  // TODO: 실제 시각화 단계에서는 "이전/이후 역" 범위를 노선 방향 선택과 함께 재정의해야 합니다.
  return [...byHour.values()];
}

export function swapSelectedStations(selectedStations) {
  if (selectedStations.length < 2) {
    return selectedStations;
  }

  return [selectedStations[1], selectedStations[0]];
}

export function formatPassengerCount(value) {
  return `${numberFormatter.format(Math.round(value))}명`;
}

export function formatRatio(value) {
  return `${(value * 100).toFixed(1)}%`;
}
