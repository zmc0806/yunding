import * as d3 from 'd3';

export const colorScale = d3.scaleOrdinal()
  .range(['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7']);

export const createXScale = (domain, range, padding = 0.1) => {
  return d3.scaleBand()
    .domain(domain)
    .range(range)
    .padding(padding);
};

export const createYScale = (domain, range) => {
  return d3.scaleLinear()
    .domain(domain)
    .nice()
    .range(range);
};