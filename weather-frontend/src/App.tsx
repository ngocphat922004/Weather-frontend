import {
  lazy,
  Suspense,
} from 'react';

import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';

import AppLayout from './components/layout/AppLayout';

import LoadingSkeleton from './components/states/LoadingSkeleton';

const DashboardPage = lazy(
  () =>
    import(
      './pages/DashboardPage/DashboardPage'
    ),
);

const ForecastPage = lazy(
  () =>
    import(
      './pages/ForecastPage/ForecastPage'
    ),
);

const AnalysisPage = lazy(
  () =>
    import(
      './pages/AnalysisPage/AnalysisPage'
    ),
);

const HistoryPage = lazy(
  () =>
    import(
      './pages/HistoryPage/HistoryPage'
    ),
);

const NotFoundPage = lazy(
  () =>
    import(
      './pages/NotFoundPage/NotFoundPage'
    ),
);

function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="page-container">
            <LoadingSkeleton />
          </div>
        }
      >
        <Routes>
          <Route element={<AppLayout />}>
            <Route
              index
              element={<DashboardPage />}
            />

            <Route
              path="forecast"
              element={<ForecastPage />}
            />

            <Route
              path="analysis"
              element={<AnalysisPage />}
            />

            <Route
              path="history"
              element={<HistoryPage />}
            />
          </Route>

          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;