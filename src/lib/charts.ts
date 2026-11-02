import {
  axisBottom,
  axisLeft,
  max,
  scaleBand,
  scaleLinear,
  select,
  type ScaleBand,
  type ScaleLinear,
  type Selection,
} from 'd3';
import { el } from './dom';

export interface ChartFrame {
  container: HTMLElement;
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  plot: Selection<SVGGElement, unknown, null, undefined>;
  xAxis: Selection<SVGGElement, unknown, null, undefined>;
  yAxis: Selection<SVGGElement, unknown, null, undefined>;
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

export interface ChartFrameOptions {
  width?: number;
  height?: number;
  margin?: Partial<ChartFrame['margin']>;
  className?: string;
}

export function createChartFrame(
  container: HTMLElement,
  options: ChartFrameOptions = {},
): ChartFrame {
  const width = options.width ?? 640;
  const height = options.height ?? 320;
  const margin = {
    top: 18,
    right: 18,
    bottom: 42,
    left: 52,
    ...options.margin,
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const root = el('div', `chart ${options.className ?? ''}`.trim());
  const svg = select(root)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const plot = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const xAxis = plot.append('g').attr('class', 'chart-axis chart-axis--x');
  const yAxis = plot.append('g').attr('class', 'chart-axis chart-axis--y');

  container.append(root);

  return {
    container: root,
    svg,
    plot,
    xAxis,
    yAxis,
    width,
    height,
    innerWidth,
    innerHeight,
    margin,
  };
}

export function renderXAxis(
  frame: ChartFrame,
  scale: ScaleLinear<number, number> | ScaleBand<string>,
  label?: string,
  tickFormat?: (value: never) => string,
): void {
  const axis = axisBottom(scale as ScaleLinear<number, number>)
    .tickSizeOuter(0)
    .tickPadding(8);
  if (tickFormat) axis.tickFormat(tickFormat as never);
  frame.xAxis
    .attr('transform', `translate(0,${frame.innerHeight})`)
    .call(axis as never);
  frame.svg.selectAll('.chart-axis-label--x').remove();
  if (label) {
    frame.svg
      .append('text')
      .attr('class', 'chart-axis-label chart-axis-label--x')
      .attr('x', frame.margin.left + frame.innerWidth / 2)
      .attr('y', frame.height - 6)
      .attr('text-anchor', 'middle')
      .text(label);
  }
}

export function renderYAxis(
  frame: ChartFrame,
  scale: ScaleLinear<number, number>,
  label?: string,
  tickFormat?: (value: number) => string,
): void {
  const axis = axisLeft(scale).ticks(5).tickSizeOuter(0).tickPadding(8);
  if (tickFormat) axis.tickFormat(tickFormat as never);
  frame.yAxis.call(axis);
  frame.svg.selectAll('.chart-axis-label--y').remove();
  if (label) {
    frame.svg
      .append('text')
      .attr('class', 'chart-axis-label chart-axis-label--y')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(frame.margin.top + frame.innerHeight / 2))
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .text(label);
  }
}

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
  key?: string;
}

export interface BarChartOptions {
  xLabel?: string;
  yLabel?: string;
  color?: string;
  highlightColor?: string;
  onHover?: (datum: BarDatum | null, index?: number) => void;
  onClick?: (datum: BarDatum, index: number) => void;
  valueFormat?: (value: number) => string;
}

export interface BarChartHandle {
  update: (data: BarDatum[], highlightedKey?: string | null) => void;
  frame: ChartFrame;
}

export function createBarChart(
  container: HTMLElement,
  data: BarDatum[],
  options: BarChartOptions = {},
): BarChartHandle {
  const frame = createChartFrame(container, { height: 300, margin: { left: 132, right: 24 } });
  const x = scaleLinear()
    .domain([0, (max(data, (datum) => datum.value) ?? 1) * 1.08])
    .nice()
    .range([0, frame.innerWidth]);
  const y = scaleBand<string>()
    .domain(data.map((datum) => datum.key ?? datum.label))
    .range([0, frame.innerHeight])
    .padding(0.24);

  renderXAxis(frame, x, options.xLabel, options.valueFormat as never);

  const bars = frame.plot
    .append('g')
    .attr('class', 'bars')
    .selectAll<SVGRectElement, BarDatum>('rect')
    .data(data, (datum) => datum.key ?? datum.label)
    .join('rect')
    .attr('x', 0)
    .attr('y', (datum) => y(datum.key ?? datum.label) ?? 0)
    .attr('height', y.bandwidth())
    .attr('rx', 1.5)
    .attr('fill', (datum) => datum.color ?? options.color ?? '#1f6f78')
    .style('cursor', options.onClick ? 'pointer' : 'default');

  const labels = frame.plot
    .append('g')
    .attr('class', 'bar-labels')
    .selectAll<SVGTextElement, BarDatum>('text')
    .data(data, (datum) => datum.key ?? datum.label)
    .join('text')
    .attr('x', (datum) => x(datum.value) + 6)
    .attr('y', (datum) => (y(datum.key ?? datum.label) ?? 0) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('class', 'bar-label')
    .text((datum) =>
      options.valueFormat ? options.valueFormat(datum.value) : String(datum.value),
    );

  const verticalAxis = frame.plot
    .append('g')
    .attr('class', 'bar-axis')
    .selectAll<SVGTextElement, BarDatum>('text')
    .data(data, (datum) => datum.key ?? datum.label)
    .join('text')
    .attr('x', -10)
    .attr('y', (datum) => (y(datum.key ?? datum.label) ?? 0) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('class', 'bar-category')
    .text((datum) => datum.label);

  if (options.onHover) {
    bars
      .on('mouseenter', (_event, datum) => options.onHover?.(datum))
      .on('mouseleave', () => options.onHover?.(null));
  }
  if (options.onClick) {
    bars.on('click', (_event, datum) => options.onClick?.(datum, data.indexOf(datum)));
  }

  const update = (next: BarDatum[], highlightedKey?: string | null) => {
    const nextX = scaleLinear()
      .domain([0, (max(next, (datum) => datum.value) ?? 1) * 1.08])
      .nice()
      .range([0, frame.innerWidth]);
    const nextY = scaleBand<string>()
      .domain(next.map((datum) => datum.key ?? datum.label))
      .range([0, frame.innerHeight])
      .padding(0.24);

    bars
      .data(next, (datum) => datum.key ?? datum.label)
      .join('rect')
      .attr('y', (datum) => nextY(datum.key ?? datum.label) ?? 0)
      .attr('height', nextY.bandwidth())
      .attr('fill', (datum) => {
        if (highlightedKey && (datum.key ?? datum.label) === highlightedKey) {
          return options.highlightColor ?? '#c8462b';
        }
        return datum.color ?? options.color ?? '#1f6f78';
      })
      .transition()
      .duration(300)
      .attr('width', (datum) => nextX(datum.value));

    labels
      .data(next, (datum) => datum.key ?? datum.label)
      .join('text')
      .attr('y', (datum) => (nextY(datum.key ?? datum.label) ?? 0) + nextY.bandwidth() / 2)
      .text((datum) =>
        options.valueFormat ? options.valueFormat(datum.value) : String(datum.value),
      )
      .transition()
      .duration(300)
      .attr('x', (datum) => nextX(datum.value) + 6);

    verticalAxis
      .data(next, (datum) => datum.key ?? datum.label)
      .join('text')
      .attr('y', (datum) => (nextY(datum.key ?? datum.label) ?? 0) + nextY.bandwidth() / 2)
      .text((datum) => datum.label);

    renderXAxis(frame, nextX, options.xLabel, options.valueFormat as never);
  };

  bars
    .attr('width', 0)
    .transition()
    .duration(500)
    .attr('width', (datum) => x(datum.value));

  return { update, frame };
}

export function histogramBins(
  values: number[],
  count = 24,
): Array<{ x0: number; x1: number; count: number }> {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / count || 1;
  const bins = Array.from({ length: count }, (_, index) => ({
    x0: min + index * step,
    x1: min + (index + 1) * step,
    count: 0,
  }));
  for (const value of values) {
    const index = Math.min(count - 1, Math.max(0, Math.floor((value - min) / step)));
    bins[index].count += 1;
  }
  return bins;
}
