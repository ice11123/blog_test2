const PLOTLY_CDN = 'https://cdn.plot.ly/plotly-3.7.0.min.js';
const PLOTLY_TIMEOUT_MS = 10_000;

type PlotlyApi = {
  newPlot: (element: HTMLElement, data: unknown[], layout: unknown, config: unknown) => Promise<unknown>;
  purge?: (element: HTMLElement) => void;
};

type PlotConfig = {
  type: 'line' | 'surface';
  xEquation: string;
  yEquation: string;
  zEquation: string;
  xSurface: string;
  ySurface: string;
  zSurface: string;
  uStart: number;
  uEnd: number;
  vStart: number;
  vEnd: number;
  tStart: number;
  tEnd: number;
  points: number;
  color: string;
};

let plotlyPromise: Promise<PlotlyApi> | undefined;
let cleanupCurrentPlots: (() => void) | undefined;

function readPlotly(): PlotlyApi | undefined {
  return (window as typeof window & { Plotly?: PlotlyApi }).Plotly;
}

function evaluateLine(expression: string, t: number): unknown {
  void t;
  return eval(expression);
}

function evaluateSurface(expression: string, u: number, v: number): unknown {
  void u;
  void v;
  return eval(expression);
}

function loadPlotly(): Promise<PlotlyApi> {
  const loaded = readPlotly();
  if (loaded) return Promise.resolve(loaded);
  if (plotlyPromise) return plotlyPromise;

  plotlyPromise = new Promise<PlotlyApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PLOTLY_CDN}"]`);
    const script = existing ?? document.createElement('script');
    const timeout = window.setTimeout(() => reject(new Error('Plotly load timeout')), PLOTLY_TIMEOUT_MS);
    const finish = () => {
      window.clearTimeout(timeout);
      const api = readPlotly();
      if (api) resolve(api);
      else reject(new Error('Plotly API missing'));
    };
    const fail = () => {
      window.clearTimeout(timeout);
      reject(new Error('Plotly CDN load failed'));
    };
    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', fail, { once: true });
    if (!existing) {
      script.src = PLOTLY_CDN;
      script.async = true;
      document.head.appendChild(script);
    }
  }).catch((error) => {
    plotlyPromise = undefined;
    throw error;
  });
  return plotlyPromise;
}

async function drawPlot(element: HTMLElement, signal: AbortSignal) {
  if (element.dataset.plotState) return;
  element.dataset.plotState = 'loading';
  try {
    const Plotly = await loadPlotly();
    if (signal.aborted || !element.isConnected) return;
    const config = JSON.parse(element.dataset.plotConfig || '{}') as PlotConfig;
    const points = Math.min(Math.max(Math.floor(config.points || 150), 2), 400);
    const rootStyles = getComputedStyle(document.documentElement);
    const plotBg = rootStyles.getPropertyValue('--plot-bg').trim() || '#121417';
    const axisColor = rootStyles.getPropertyValue('--plot-axis-color').trim() || '#ffffff';
    const layout = {
      showlegend: false,
      autosize: true,
      margin: { l: 0, r: 0, t: 0, b: 0 },
      scene: {
        xaxis: { visible: true, color: axisColor },
        yaxis: { visible: true, color: axisColor },
        zaxis: { visible: true, color: axisColor },
        bgcolor: plotBg,
        domain: { x: [0, 1], y: [0, 1] },
        aspectmode: 'data',
      },
      paper_bgcolor: plotBg,
      plot_bgcolor: plotBg,
    };
    const displayConfig = { displayModeBar: false, displaylogo: false };

    if (config.type === 'surface') {
      const { uStart, uEnd, vStart, vEnd, xSurface, ySurface, zSurface } = config;
      const du = (uEnd - uStart) / points;
      const dv = (vEnd - vStart) / points;
      const uValues = Array.from({ length: points }, (_, index) => uStart + index * du);
      const vValues = Array.from({ length: points }, (_, index) => vStart + index * dv);
      const x = uValues.map((u) => vValues.map((v) => evaluateSurface(xSurface, u, v)));
      const y = uValues.map((u) => vValues.map((v) => evaluateSurface(ySurface, u, v)));
      const z = uValues.map((u) => vValues.map((v) => evaluateSurface(zSurface, u, v)));
      await Plotly.newPlot(element, [{ type: 'surface', x, y, z, colorscale: 'Viridis', showscale: false }], layout, displayConfig);
    } else {
      const { tStart, tEnd, xEquation, yEquation, zEquation, color } = config;
      const dt = (tEnd - tStart) / points;
      const tValues = Array.from({ length: points }, (_, index) => tStart + index * dt);
      const x = tValues.map((t) => evaluateLine(xEquation, t));
      const y = tValues.map((t) => evaluateLine(yEquation, t));
      const z = tValues.map((t) => evaluateLine(zEquation, t));
      await Plotly.newPlot(element, [{ type: 'scatter3d', mode: 'lines', x, y, z, line: { width: 4, color } }], layout, displayConfig);
    }
    if (!signal.aborted) element.dataset.plotState = 'loaded';
  } catch (error) {
    if (signal.aborted) return;
    console.warn('Plot3D render failed:', error);
    element.dataset.plotState = 'error';
    element.classList.add('plot-load-error');
    element.setAttribute('role', 'status');
    element.textContent = '三维图形暂时无法加载，请稍后刷新重试。';
  }
}

function initPlot3d() {
  cleanupCurrentPlots?.();
  const roots = Array.from(document.querySelectorAll<HTMLElement>('[data-plot3d]'));
  if (roots.length === 0) {
    cleanupCurrentPlots = undefined;
    return;
  }

  const controller = new AbortController();
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer?.unobserve(entry.target);
          void drawPlot(entry.target as HTMLElement, controller.signal);
        }
      }, { rootMargin: '240px 0px', threshold: 0.01 })
    : undefined;

  for (const root of roots) {
    if (observer) observer.observe(root);
    else void drawPlot(root, controller.signal);
  }

  cleanupCurrentPlots = () => {
    observer?.disconnect();
    controller.abort();
    const Plotly = readPlotly();
    for (const root of roots) Plotly?.purge?.(root);
  };
}

initPlot3d();
document.addEventListener('astro:page-load', initPlot3d);
document.addEventListener('astro:before-swap', () => cleanupCurrentPlots?.());
