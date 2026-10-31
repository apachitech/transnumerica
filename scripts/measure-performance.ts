import { chromium } from 'playwright';

interface MetricResult {
  route: string;
  mode: 'default' | 'data-saver';
  ttfb: number;
  fcp: number;
  lcp: number;
  cls: number;
  domContentLoaded: number;
  loadTime: number;
  totalTransferredBytes: number;
  jsTransferredBytes: number;
  imgTransferredBytes: number;
  resourceCount: number;
}

async function measureRoute(url: string, routeName: string, dataSaver: boolean): Promise<MetricResult> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 360, height: 640 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 10; SM-A102U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  // Setup CDP Session for exact 3G & 4x CPU Throttling
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');

  // 3G profile: 1.6 Mbps down, 750 Kbps up, 150ms RTT
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: Math.floor((1600 * 1024) / 8),
    uploadThroughput: Math.floor((750 * 1024) / 8),
    connectionType: 'cellular3g',
  });

  // 4x CPU slowdown (typical low-end MediaTek / Exynos processor)
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  // Track network transfer
  let totalBytes = 0;
  let jsBytes = 0;
  let imgBytes = 0;
  let resourceCount = 0;

  client.on('Network.dataReceived', (event: any) => {
    totalBytes += event.dataLength || 0;
  });

  client.on('Network.responseReceived', (event: any) => {
    resourceCount++;
    const mime = event.response?.mimeType || '';
    const length = event.response?.encodedDataLength || 0;
    if (mime.includes('javascript') || mime.includes('ecmascript')) {
      jsBytes += length;
    } else if (mime.startsWith('image/')) {
      imgBytes += length;
    }
  });

  if (dataSaver) {
    // Set localStorage flag and saveData header
    await page.addInitScript(() => {
      localStorage.setItem('tn_datasaver', 'true');
      document.documentElement.classList.add('tn-data-saver');
    });
  }

  // Inject Web Vitals observer before page scripts execute
  await page.addInitScript(() => {
    (window as any).__vitals = { lcp: 0, cls: 0, fcp: 0 };

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        (window as any).__vitals.lcp = entry.startTime;
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          (window as any).__vitals.cls += entry.value;
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          (window as any).__vitals.fcp = entry.startTime;
        }
      }
    }).observe({ type: 'paint', buffered: true });
  });

  const response = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(2500); // allow LCP observer to settle

  const perfMetrics: any = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const vitals = (window as any).__vitals || {};
    return {
      ttfb: Math.round(nav ? nav.responseStart - nav.requestStart : 0),
      domContentLoaded: Math.round(nav ? nav.domContentLoadedEventEnd - nav.startTime : 0),
      loadTime: Math.round(nav ? nav.loadEventEnd - nav.startTime : 0),
      fcp: Math.round(vitals.fcp || 0),
      lcp: Math.round(vitals.lcp || 0),
      cls: Number((vitals.cls || 0).toFixed(4)),
    };
  });

  await browser.close();

  return {
    route: routeName,
    mode: dataSaver ? 'data-saver' : 'default',
    ttfb: perfMetrics.ttfb,
    fcp: perfMetrics.fcp,
    lcp: perfMetrics.lcp,
    cls: perfMetrics.cls,
    domContentLoaded: perfMetrics.domContentLoaded,
    loadTime: perfMetrics.loadTime,
    totalTransferredBytes: totalBytes,
    jsTransferredBytes: jsBytes,
    imgTransferredBytes: imgBytes,
    resourceCount,
  };
}

async function main() {
  console.log('🚀 Starting Performance Benchmark: Low-End Android on 3G Throttling');
  console.log('Profile: 1.6 Mbps Down / 750 Kbps Up / 150ms Latency / 4x CPU Slowdown\n');

  const tests = [
    { url: 'http://localhost:3000', name: 'Homepage (/)', dataSaver: false },
    { url: 'http://localhost:3000', name: 'Homepage (/)', dataSaver: true },
    { url: 'http://localhost:3000/bus', name: 'Bus Search (/bus)', dataSaver: false },
    { url: 'http://localhost:3000/bus', name: 'Bus Search (/bus)', dataSaver: true },
    { url: 'http://localhost:3000/rides', name: 'Live Rides (/rides)', dataSaver: false },
    { url: 'http://localhost:3000/rides', name: 'Live Rides (/rides)', dataSaver: true },
  ];

  const results: MetricResult[] = [];

  for (const test of tests) {
    console.log(`Running ${test.name} [${test.dataSaver ? 'ÉCONOMIE DE DONNÉES' : 'STANDARD'}]...`);
    try {
      const res = await measureRoute(test.url, test.name, test.dataSaver);
      results.push(res);
      console.log(`  ✓ LCP: ${res.lcp}ms | FCP: ${res.fcp}ms | CLS: ${res.cls} | Total Data: ${Math.round(res.totalTransferredBytes / 1024)} KB`);
    } catch (err) {
      console.error(`  ✗ Error running ${test.name}:`, err);
    }
  }

  console.log('\n================ BENCHMARK RESULTS TABLE ================');
  console.table(
    results.map((r) => ({
      Route: r.route,
      Mode: r.mode,
      'TTFB (ms)': r.ttfb,
      'FCP (ms)': r.fcp,
      'LCP (ms)': r.lcp,
      CLS: r.cls,
      'Total KB': Math.round(r.totalTransferredBytes / 1024),
      'JS KB': Math.round(r.jsTransferredBytes / 1024),
      'Img KB': Math.round(r.imgTransferredBytes / 1024),
    }))
  );
}

main().catch(console.error);
