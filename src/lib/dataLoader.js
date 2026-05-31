import { csvParse } from 'd3-dsv';

const DATA_BASE_PATH = '/data';

// 원본 CSV 컬럼명은 이 파일 안에서만 직접 다룹니다.
// 나머지 컴포넌트와 유틸은 앱 내부 모델(date, originStation 등)만 사용합니다.
const CSV_COLUMNS = {
  date: '기준_날짜',
  originStation: '승차_역',
  destinationStation: '하차_역',
  hour: '승차시간',
  passengerCount: '인원수',
};

export const subwayCsvFiles = Array.from({ length: 31 }, (_, index) => {
  const day = String(index + 1).padStart(2, '0');
  return `지하철_2호선_순환선_OD_통계_202505${day}.csv`;
});

export function adaptSubwayRow(row) {
  return {
    date: String(row[CSV_COLUMNS.date]),
    originStation: row[CSV_COLUMNS.originStation],
    destinationStation: row[CSV_COLUMNS.destinationStation],
    hour: Number(row[CSV_COLUMNS.hour]),
    passengerCount: Number(row[CSV_COLUMNS.passengerCount]),
  };
}

function formatDateLabel(value) {
  return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
}

function summarizeRows(rows, files) {
  const dates = new Set();
  const stations = new Set();
  const hourlyPassengerCounts = new Map();
  let totalPassengers = 0;

  for (const row of rows) {
    dates.add(row.date);
    stations.add(row.originStation);
    stations.add(row.destinationStation);
    totalPassengers += row.passengerCount;
    hourlyPassengerCounts.set(
      row.hour,
      (hourlyPassengerCounts.get(row.hour) ?? 0) + row.passengerCount,
    );
  }

  const busiestHour = [...hourlyPassengerCounts.entries()].sort((a, b) => b[1] - a[1]).at(0);
  const sortedDates = [...dates].sort();

  return {
    fileCount: files.length,
    rowCount: rows.length,
    stationCount: stations.size,
    totalPassengers,
    dateRange:
      sortedDates.length > 0
        ? `${formatDateLabel(sortedDates[0])} - ${formatDateLabel(sortedDates.at(-1))}`
        : '-',
    busiestHour:
      busiestHour == null
        ? null
        : {
            hour: busiestHour[0],
            passengerCount: busiestHour[1],
          },
  };
}

async function loadCsvFile(fileName) {
  const response = await fetch(`${DATA_BASE_PATH}/${encodeURIComponent(fileName)}`);

  if (!response.ok) {
    throw new Error(`${fileName} 로드 실패 (${response.status})`);
  }

  const text = await response.text();
  return csvParse(text, adaptSubwayRow);
}

export async function loadSubwayData() {
  const fileRows = await Promise.all(subwayCsvFiles.map(loadCsvFile));
  const rows = fileRows.flat();

  return {
    rows,
    summary: summarizeRows(rows, subwayCsvFiles),
  };
}
