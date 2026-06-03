import { useEffect, useMemo, useState } from 'react';
import FilterPanel from './components/FilterPanel.jsx';
import FlowChart from './components/FlowChart.jsx';
import LineMap from './components/LineMap.jsx';
import StationInfoPanel from './components/StationInfoPanel.jsx';
import TopStations from './components/TopStations.jsx';
import { loadSubwayData } from './lib/dataLoader.js';
import {
  buildLineMapStationList,
  buildStationList,
  filterRows,
  getHourlyFlowSeries,
  getStationBriefMap,
  getStationFlowSummary,
  getTopStations,
  getTwoStationStackedSeries,
  swapSelectedStations,
  getCircleTrafficSeries,
} from './utils/flowUtils.js';

const DEFAULT_FILTERS = {
  selectedDays: [1, 2, 3, 4, 5],
  dayType: 'weekday',
  includeHolidays: false,
  hour: 8,
};

export default function App() {
  const [loadState, setLoadState] = useState({
    status: 'loading',
    rows: [],
    summary: null,
    error: null,
  });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedStations, setSelectedStations] = useState([]);

  // CSV는 최초 1회만 로드합니다. 이후 필터와 선택 상태는 메모리 데이터로 계산합니다.
  useEffect(() => {
    let isMounted = true;

    loadSubwayData()
      .then(({ rows, summary }) => {
        if (isMounted) {
          setLoadState({ status: 'ready', rows, summary, error: null });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setLoadState({ status: 'error', rows: [], summary: null, error });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 선택한 시간/요일/구분 필터가 반영된 기본 데이터셋입니다.
  const filteredRows = useMemo(
    () => filterRows(loadState.rows, filters),
    [loadState.rows, filters],
  );

  // 라인맵은 실제 데이터에 존재하는 역만 보여주되, flowUtils의 2호선 순서 fallback을 따릅니다.
  const stations = useMemo(
    () => buildStationList(loadState.rows),
    [loadState.rows],
  );

  const lineMapStations = useMemo(
    () => buildLineMapStationList(stations),
    [stations],
  );

  const stationBriefs = useMemo(
    () => getStationBriefMap(filteredRows),
    [filteredRows],
  );

  const hourlySeries = useMemo(
  () => getHourlyFlowSeries(loadState.rows, filters, selectedStations[0]), // 👈 selectedStations[0] 추가
  [loadState.rows, filters, selectedStations], // 👈 디펜던시에 selectedStations 추가
  );
  const topStations = useMemo(
    () => getTopStations(filteredRows, 3),
    [filteredRows],
  );

  const stationSummary = useMemo(
    () => getStationFlowSummary(filteredRows, selectedStations[0]),
    [filteredRows, selectedStations],
  );

  const odSeries = useMemo(
    () =>
      getTwoStationStackedSeries({
        rows: loadState.rows,
        filters,
        stations,
        originStation: selectedStations[0],
        destinationStation: selectedStations[1],
      }),
    [loadState.rows, filters, stations, selectedStations],
  );

  const odStackLabels = useMemo(() => {
    const [originStation, destinationStation] = selectedStations;

    if (!originStation || !destinationStation) {
      return {};
    }

    return {
      direct: `${originStation} 탑승 -> ${destinationStation} 하차`,
      beforeToDestination: `${originStation} 이전 역 탑승 -> ${destinationStation} 하차`,
      originToAfter: `${originStation} 탑승 -> ${destinationStation} 이후 역 하차`,
    };
  }, [selectedStations]);

  function handleStationClick(stationName) {
    setSelectedStations((current) => {
      // 이미 선택된 역을 다시 누르면 선택 해제합니다.
      if (current.includes(stationName)) {
        return current.filter((name) => name !== stationName);
      }

      // 최대 2개 역만 유지합니다. 세 번째 역을 누르면 오래된 첫 번째 선택을 밀어냅니다.
      if (current.length >= 2) {
        return [current[1], stationName];
      }

      return [...current, stationName];
    });
  }

  function handleSwapDirection() {
    setSelectedStations((current) => swapSelectedStations(current));
  }

  const isReady = loadState.status === 'ready';
  const hasSelectedStation = selectedStations.length > 0;
  const hasTwoStations = selectedStations.length === 2;

  const circleTraffic = useMemo(
    () => getCircleTrafficSeries(filteredRows),
    [filteredRows],
  );

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">서울 지하철 2호선 순환선 OD 통계</p>
          <h1>2호선 유동량 대시보드</h1>
        </div>
        {loadState.summary && (
          <p className="dataset-note">
            {loadState.summary.dateRange} · CSV {loadState.summary.fileCount}개 ·{' '}
            {loadState.summary.rowCount.toLocaleString('ko-KR')}행
          </p>
        )}
      </header>

      <div className="filter-dock">
        <FilterPanel filters={filters} onChange={setFilters} />
      </div>

      {loadState.status === 'loading' && (
        <p className="status-message">데이터를 불러오는 중입니다.</p>
      )}

      {loadState.status === 'error' && (
        <p className="status-message error">
          데이터를 불러오지 못했습니다: {loadState.error.message}
        </p>
      )}

      {isReady && (
        <>
          <section className="initial-stage" aria-label="초기 대시보드 화면">
            <div className="top-stations-center">
              <TopStations stations={topStations} />
            </div>

            <LineMap
              stationBriefs={stationBriefs}
              stations={lineMapStations}
              selectedStations={selectedStations}
              onStationClick={handleStationClick}
              circleTraffic={circleTraffic}
            />
          </section>

          {hasSelectedStation && (
            <section className={`dashboard-grid detail-grid ${hasTwoStations ? 'is-chart-only' : ''}`}>
              {!hasTwoStations && (
                <StationInfoPanel
                  selectedStations={selectedStations}
                  summary={stationSummary}
                />
              )}
              {hasTwoStations ? (
                <FlowChart
                  mode="stacked"
                  title="선택 OD 시간대별 이동량"
                  description={`${selectedStations[0]} → ${selectedStations[1]} 기준`}
                  actionLabel="방향 뒤집기"
                  onAction={handleSwapDirection}
                  selectedHour={filters.hour}
                  series={odSeries}
                  stackLabels={odStackLabels}
                />
              ) : (
                <FlowChart
                  mode="total"
                  title="전체 시간대별 유동량"
                  description={`${selectedStations[0]}에서의 시간별 승차&하차 인원의 합계를 확인합니다.`}
                  selectedHour={filters.hour}
                  series={hourlySeries}
                />
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
