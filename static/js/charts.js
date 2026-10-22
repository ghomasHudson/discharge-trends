/* Chart.js views of monthly values recovered from the supplied vector PDFs. */
(() => {
  'use strict';
  const data = window.dischargeChartData;
  if (!data || !window.Chart) return;

  const categories = [
    ['blood', 'Blood test', '#2874a6'],
    ['observation', 'Clinical observation', '#c27319'],
    ['imaging', 'Imaging', '#39824b'],
    ['symptoms', 'Monitor for symptoms', '#d05a61'],
    ['other', 'Other', '#8b6cb2'],
    ['referral', 'Referral', '#9c7060'],
    ['medications', 'Medication review', '#c46ca6'],
    ['reviewTest', 'Review test results', '#88929d'],
    ['aware', 'To be aware', '#a6a33c'],
  ];
  const dates = data.months.map(month => new Date(`${month}-01T00:00:00Z`));
  const labels = dates.map(date => date.toLocaleDateString('en-GB', {
    month: 'short', year: 'numeric', timeZone: 'UTC',
  }));

  document.querySelectorAll('[data-chart]').forEach(panel => {
    const kind = panel.dataset.chart;
    const stacked = kind === 'types';
    const count = labels.length;
    const format = value => stacked ? `${(value * 100).toFixed(1)}%`
      : kind === 'requests' ? value.toFixed(2) : `${value.toFixed(1)} days`;
    const canvas = document.createElement('canvas');
    canvas.id = `${kind}-chart`;
    canvas.setAttribute('role', 'img');
    canvas.tabIndex = 0;
    const chartLabel = panel.querySelector('figcaption').textContent;
    const chartContainer = panel.querySelector('.chart-canvas');
    chartContainer.replaceChildren(canvas);
    chartContainer.classList.add('is-interactive');

    let current = count - 1;
    const legendValues = new Map();

    function inspect(index) {
      current = index;
      let value;
      if (stacked) {
        value = 'All types · 100%';
        categories.forEach(([key]) => {
          legendValues.get(key).textContent = format(data.types[key][index]);
        });
      } else {
        value = format(data[kind].values[index]);
      }
      canvas.setAttribute('aria-label', `${chartLabel}. ${labels[index]}: ${value}. Use arrow keys to explore months.`);
    }

    if (stacked) {
      const legend = panel.querySelector('.chart-legend');
      categories.forEach(([key, label, color]) => {
        const item = document.createElement('div');
        item.className = 'chart-legend-item';
        const swatch = document.createElement('span');
        swatch.className = 'chart-swatch';
        swatch.style.backgroundColor = color;
        const name = document.createElement('span');
        name.textContent = label;
        const amount = document.createElement('strong');
        item.append(swatch, name, amount);
        legend.append(item);
        legendValues.set(key, amount);
      });
      legend.hidden = false;
    }

    const datasets = stacked ? [...categories].reverse().map(([key, label, color]) => ({
      label, category: key, data: data.types[key], backgroundColor: color,
      borderWidth: 0, categoryPercentage: 1, barPercentage: .95,
    })) : [
      {label: 'Monthly average', data: data[kind].values, borderColor: '#2563eb',
        backgroundColor: '#2563eb', borderWidth: 2, pointRadius: 0, pointHoverRadius: 5},
      {label: kind === 'requests' ? 'Smoothed trend' : 'Linear trend', data: data[kind].trend,
        borderColor: '#bf6741', borderWidth: 2, borderDash: [7, 5], pointRadius: 0, pointHoverRadius: 0},
    ];
    function inspectEvent(event, elements) {
      if (elements.length) inspect(elements[0].index);
    }
    const chart = new Chart(canvas, {
      type: stacked ? 'bar' : 'line',
      data: {labels, datasets},
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        color: '#64748b',
        font: {family: "'Inter', sans-serif", size: 11},
        interaction: {mode: 'index', intersect: false},
        onHover: inspectEvent,
        onClick: inspectEvent,
        plugins: {
          legend: {display: false},
          tooltip: {
            filter: context => stacked || context.datasetIndex === 0,
            callbacks: {label: context => stacked ? '' : `${context.dataset.label}: ${format(context.parsed.y)}`},
          },
        },
        scales: {
          x: {
            stacked,
            grid: {display: false},
            border: {display: false},
            ticks: {autoSkip: false, maxRotation: 0, callback: (tick, index) =>
              [0, 21, 45, 69, 93].includes(index) ? dates[index].getUTCFullYear() : null},
          },
          y: {
            stacked,
            min: stacked ? 0 : kind === 'requests' ? .8 : 10,
            max: stacked ? 1 : kind === 'requests' ? 1.6 : 35,
            border: {display: false},
            grid: {color: '#e2e8f0'},
            title: {display: true, text: stacked ? 'Share of all requests' : kind === 'requests' ? 'Requests per discharge' : 'Days'},
            ticks: {stepSize: stacked ? .25 : kind === 'requests' ? .2 : 5,
              callback: tick => stacked ? `${tick * 100}%` : tick},
          },
        },
      },
    });
    canvas.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1
        : Math.max(0, Math.min(count - 1, current + (event.key === 'ArrowRight' ? 1 : -1)));
      inspect(index);
      const active = chart.data.datasets.map((dataset, datasetIndex) => ({datasetIndex, index: current}))
        .filter(item => chart.isDatasetVisible(item.datasetIndex));
      chart.setActiveElements(active);
      chart.tooltip.setActiveElements(active, {x: chart.scales.x.getPixelForValue(current), y: chart.chartArea.top});
      chart.update('none');
    });
    canvas.setAttribute('aria-label', `${chartLabel}. Use arrow keys to explore months.`);
  });
})();
