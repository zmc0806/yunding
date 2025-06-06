<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { industryData } from '../data/industryData.js';
  import { colorScale } from '../utils/scales.js';
  import { formatNumber } from '../utils/formatters.js';

  let svg;
  let tooltip;
  let sortMode = 'default'; // default, devices, companies, ratio
  let hoveredIndex = -1;

  // 排序选项配置
  const sortOptions = {
    default: { label: '默认排序', icon: '📋' },
    devices: { label: '设备数量', icon: '📱' },
    companies: { label: '企业数量', icon: '🏢' },
    ratio: { label: '设备密度', icon: '📊' }
  };

  // 根据排序模式处理数据
  $: sortedData = (() => {
    let data = [...industryData].map(d => ({
      ...d,
      deviceRatio: Math.round(d.devices / d.companies),
      color: colorScale(industryData.findIndex(item => item.name === d.name))
    }));

    switch(sortMode) {
      case 'devices':
        return data.sort((a, b) => b.devices - a.devices);
      case 'companies':
        return data.sort((a, b) => b.companies - a.companies);
      case 'ratio':
        return data.sort((a, b) => b.deviceRatio - a.deviceRatio);
      default:
        return data;
    }
  })();

  // 统计信息
  $: stats = {
    totalDevices: industryData.reduce((sum, d) => sum + d.devices, 0),
    avgDevicesPerCompany: Math.round(
      industryData.reduce((sum, d) => sum + d.devices, 0) / 
      industryData.reduce((sum, d) => sum + d.companies, 0)
    ),
    maxDevices: Math.max(...industryData.map(d => d.devices)),
    minDevices: Math.min(...industryData.map(d => d.devices))
  };

  onMount(() => {
    drawChart();
  });

  $: if (svg && sortedData) {
    drawChart();
  }

  function drawChart() {
    if (!svg) return;
    
    d3.select(svg).selectAll("*").remove();

    const margin = {top: 30, right: 40, bottom: 100, left: 80}; // 增加底部边距
    const width = 800 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const svgElement = d3.select(svg)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svgElement.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(sortedData.map(d => d.name))
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d.devices)])
      .nice()
      .range([height, 0]);

    // 添加网格线
    const gridLines = g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat('')
      );

    gridLines.selectAll('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);

    // X轴 - 调整标签角度和位置
    const xAxis = g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    xAxis.selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.15em');

    // Y轴
    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickFormat(d => {
          if (d >= 1000) return (d / 1000) + 'K';
          return d;
        }))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', '500');

    // Y轴标签
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -(height / 2))
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', '#4a5568')
      .text('设备总数（台）');

    // X轴标签
    g.append('text')
      .attr('transform', `translate(${width/2}, ${height + 80})`)
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', '#4a5568')
      .text('行业类别');

    // 柱状图
    const bars = g.selectAll('.bar')
      .data(sortedData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.name))
      .attr('width', xScale.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', d => d.color)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        const index = sortedData.findIndex(item => item.name === d.name);
        hoveredIndex = index;
        
        d3.select(this)
          .transition().duration(200)
          .attr('fill', d3.color(d.color).brighter(0.3))
          .attr('stroke', '#333')
          .attr('stroke-width', 2);
        
        showTooltip(event, d);
      })
      .on('mouseout', function(event, d) {
        hoveredIndex = -1;
        
        d3.select(this)
          .transition().duration(200)
          .attr('fill', d.color)
          .attr('stroke', 'none');
        
        hideTooltip();
      });

    // 柱状图动画
    bars.transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('y', d => yScale(d.devices))
      .attr('height', d => height - yScale(d.devices));

    // 添加数值标签
    g.selectAll('.bar-label')
      .data(sortedData)
      .enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', d => xScale(d.name) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.devices) - 8)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('fill', '#4a5568')
      .style('opacity', 0)
      .text(d => {
        if (d.devices >= 1000) return Math.round(d.devices / 1000) + 'K';
        return d.devices;
      })
      .transition()
      .duration(600)
      .delay((d, i) => i * 100 + 400)
      .style('opacity', 1);

    // 添加平均线
    const avgDevices = stats.totalDevices / industryData.length;
    g.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', yScale(avgDevices))
      .attr('y2', yScale(avgDevices))
      .attr('stroke', '#f56565')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay(800)
      .style('opacity', 0.8);

    // 平均线标签
    g.append('text')
      .attr('x', width - 5)
      .attr('y', yScale(avgDevices) - 5)
      .attr('text-anchor', 'end')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#f56565')
      .style('opacity', 0)
      .text(`平均值: ${Math.round(avgDevices)}`)
      .transition()
      .duration(1000)
      .delay(800)
      .style('opacity', 1);
  }

  function showTooltip(event, d) {
    if (tooltip) {
      tooltip.style.opacity = '1';
      tooltip.style.left = (event.pageX + 10) + 'px';
      tooltip.style.top = (event.pageY - 10) + 'px';
      tooltip.innerHTML = `
        <div class="tooltip-header">
          <strong>${d.name}行业</strong>
        </div>
        <div class="tooltip-content">
          <div class="tooltip-row">
            <span class="tooltip-label">设备总数:</span>
            <span class="tooltip-value">${formatNumber(d.devices)} 台</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">企业数量:</span>
            <span class="tooltip-value">${formatNumber(d.companies)} 家</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">设备密度:</span>
            <span class="tooltip-value">${d.deviceRatio} 台/企业</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">用户数量:</span>
            <span class="tooltip-value">${formatNumber(d.users)} 人</span>
          </div>
        </div>
      `;
    }
  }

  function hideTooltip() {
    if (tooltip) {
      tooltip.style.opacity = '0';
    }
  }

  function changeSortMode(mode) {
    sortMode = mode;
  }
</script>

<div class="device-deployment">
  <!-- 控制面板 -->
  <div class="controls-panel">
    <!-- 排序选项 -->
    <div class="sort-controls">
      <span class="control-label">排序方式:</span>
      {#each Object.entries(sortOptions) as [key, option]}
        <button 
          class="sort-btn"
          class:active={sortMode === key}
          on:click={() => changeSortMode(key)}
        >
          <span class="btn-icon">{option.icon}</span>
          <span class="btn-text">{option.label}</span>
        </button>
      {/each}
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stat-item">
        <span class="stat-value">{formatNumber(stats.totalDevices)}</span>
        <span class="stat-label">设备总数</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{stats.avgDevicesPerCompany}</span>
        <span class="stat-label">平均密度</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{formatNumber(stats.maxDevices)}</span>
        <span class="stat-label">最大部署</span>
      </div>
    </div>
  </div>

  <!-- 图表区域 -->
  <div class="chart-container">
    <svg bind:this={svg}></svg>
  </div>

  <!-- 数据表格 -->
  <div class="data-table">
    <div class="table-header">
      <div class="table-title">详细数据</div>
      <div class="table-subtitle">当前排序: {sortOptions[sortMode].label}</div>
    </div>
    <div class="table-content">
      <div class="table-row table-head">
        <div class="table-cell">排名</div>
        <div class="table-cell">行业</div>
        <div class="table-cell">设备数量</div>
        <div class="table-cell">企业数量</div>
        <div class="table-cell">设备密度</div>
        <div class="table-cell">占比</div>
      </div>
      {#each sortedData as item, index}
        <div 
          class="table-row"
          class:highlighted={hoveredIndex === index}
        >
          <div class="table-cell rank">#{index + 1}</div>
          <div class="table-cell industry">
            <div class="color-dot" style="background-color: {item.color}"></div>
            {item.name}
          </div>
          <div class="table-cell">{formatNumber(item.devices)} 台</div>
          <div class="table-cell">{formatNumber(item.companies)} 家</div>
          <div class="table-cell density">{item.deviceRatio} 台/企业</div>
          <div class="table-cell">
            {((item.devices / stats.totalDevices) * 100).toFixed(1)}%
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="tooltip" bind:this={tooltip}></div>
</div>

<style>
  .device-deployment {
    width: 100%;
  }

  .controls-panel {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    flex-wrap: wrap;
    gap: 20px;
  }

  .sort-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .control-label {
    font-weight: 600;
    color: #4a5568;
    font-size: 14px;
    margin-right: 8px;
  }

  .sort-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 20px;
    background: white;
    color: #4a5568;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 13px;
  }

  .sort-btn:hover {
    border-color: #667eea;
    transform: translateY(-1px);
  }

  .sort-btn.active {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-color: transparent;
  }

  .btn-icon {
    font-size: 14px;
  }

  .btn-text {
    font-size: 13px;
  }

  .stats-overview {
    display: flex;
    gap: 24px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .stat-value {
    font-size: 1.4rem;
    font-weight: bold;
    color: #667eea;
    line-height: 1;
  }

  .stat-label {
    font-size: 12px;
    color: #718096;
    margin-top: 4px;
    font-weight: 500;
  }

  .chart-container {
    background: #fafbfc;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 30px;
    border: 1px solid #e2e8f0;
    display: flex;
    justify-content: center;
  }

  .data-table {
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }

  .table-header {
    padding: 16px 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
  }

  .table-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .table-subtitle {
    font-size: 13px;
    opacity: 0.9;
  }

  .table-content {
    max-height: 300px;
    overflow-y: auto;
  }

  .table-row {
    display: grid;
    grid-template-columns: 60px 120px 120px 120px 120px 100px;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid #e2e8f0;
    transition: all 0.2s ease;
  }

  .table-row:hover,
  .table-row.highlighted {
    background: #f7fafc;
  }

  .table-head {
    background: #f8fafc;
    font-weight: 600;
    color: #4a5568;
    font-size: 13px;
  }

  .table-cell {
    font-size: 13px;
    color: #2d3748;
  }

  .table-cell.rank {
    font-weight: bold;
    color: #667eea;
  }

  .table-cell.industry {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .table-cell.density {
    font-weight: 600;
    color: #48bb78;
  }

  .tooltip {
    position: absolute;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0;
    font-size: 12px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1000;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    min-width: 220px;
  }

  .tooltip-header {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 10px 12px;
    border-radius: 8px 8px 0 0;
    font-weight: bold;
    text-align: center;
  }

  .tooltip-content {
    padding: 12px;
  }

  .tooltip-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .tooltip-row:last-child {
    margin-bottom: 0;
  }

  .tooltip-label {
    color: #718096;
    font-weight: 500;
  }

  .tooltip-value {
    color: #2d3748;
    font-weight: 600;
  }

  /* 滚动条样式 */
  .table-content::-webkit-scrollbar {
    width: 6px;
  }

  .table-content::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .table-content::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  /* 响应式设计 */
  @media (max-width: 1200px) {
    .controls-panel {
      flex-direction: column;
      align-items: stretch;
    }

    .sort-controls {
      justify-content: center;
    }

    .stats-overview {
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    .table-row {
      grid-template-columns: 50px 100px 100px 80px 90px 80px;
      padding: 10px 15px;
    }

    .sort-controls {
      flex-direction: column;
      gap: 8px;
    }

    .sort-btn {
      width: 100%;
      justify-content: center;
    }

    .stats-overview {
      flex-direction: column;
      gap: 12px;
    }

    .chart-container {
      padding: 15px;
    }
  }

  @media (max-width: 480px) {
    .table-row {
      grid-template-columns: 1fr;
      gap: 4px;
      text-align: center;
    }

    .table-cell::before {
      content: attr(data-label) ': ';
      font-weight: bold;
      color: #4a5568;
    }

    .table-head {
      display: none;
    }

    .controls-panel {
      padding: 15px;
    }
  }
</style>