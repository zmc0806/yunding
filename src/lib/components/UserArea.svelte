<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { yearlyData } from '../data/industryData.js';
  import { formatNumber } from '../utils/formatters.js';

  let svg;
  let tooltip;
  let viewMode = 'absolute'; // absolute, relative, growth
  let selectedYear = null;

  // 视图模式配置
  const viewModes = {
    absolute: {
      title: '数值趋势',
      icon: '📊',
      description: '显示用户数量的绝对值变化'
    },

  };

  // 数据处理
  $: processedData = (() => {
    const baseYear = yearlyData[0];
    return yearlyData.map((d, i) => {
      const prevYear = i > 0 ? yearlyData[i - 1] : d;
      return {
        ...d,
        totalGrowthRate: i > 0 ? ((d.users - prevYear.users) / prevYear.users * 100) : 0,
        activeGrowthRate: i > 0 ? ((d.activeUsers - prevYear.activeUsers) / prevYear.activeUsers * 100) : 0,
        cumulativeGrowthTotal: ((d.users - baseYear.users) / baseYear.users * 100),
        cumulativeGrowthActive: ((d.activeUsers - baseYear.activeUsers) / baseYear.activeUsers * 100),
        efficiency: (d.activeUsers / d.users * 100),
        userDensity: d.users / d.count // 平均每个新企业的用户数
      };
    });
  })();

  // 统计信息
  $: stats = {
    totalGrowth: ((processedData[processedData.length - 1].users - processedData[0].users) / processedData[0].users * 100),
    avgAnnualGrowth: d3.mean(processedData.slice(1), d => d.totalGrowthRate),
    peakYear: processedData.reduce((max, d) => d.users > max.users ? d : max),
    bestGrowthYear: processedData.slice(1).reduce((max, d) => d.totalGrowthRate > max.totalGrowthRate ? d : max)
  };

  onMount(() => {
    drawChart();
  });

  $: if (svg) {
    drawChart();
  }

  function drawChart() {
    if (!svg) return;
    
    d3.select(svg).selectAll("*").remove();

    const margin = {top: 40, right: 120, bottom: 80, left: 100};
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svgElement = d3.select(svg)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svgElement.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 合并实际数据
    const allData = processedData;
    const actualData = processedData;

    // 比例尺
    const xScale = d3.scaleLinear()
      .domain(d3.extent(allData, d => d.year))
      .range([0, width]);

    let yScale, yAccessor1, yAccessor2, yLabel;

    switch(viewMode) {
      case 'relative':
        yScale = d3.scaleLinear()
          .domain(d3.extent(actualData.slice(1), d => Math.max(d.totalGrowthRate, d.activeGrowthRate)))
          .nice()
          .range([height, 0]);
        yAccessor1 = d => d.totalGrowthRate || 0;
        yAccessor2 = d => d.activeGrowthRate || 0;
        yLabel = '年度增长率（%）';
        break;
      case 'growth':
        yScale = d3.scaleLinear()
          .domain([0, d3.max(actualData, d => Math.max(d.cumulativeGrowthTotal, d.cumulativeGrowthActive))])
          .nice()
          .range([height, 0]);
        yAccessor1 = d => d.cumulativeGrowthTotal || 0;
        yAccessor2 = d => d.cumulativeGrowthActive || 0;
        yLabel = '累积增长率（%）';
        break;
      default: // absolute
        yScale = d3.scaleLinear()
          .domain([0, d3.max(allData, d => Math.max(d.users, d.activeUsers))])
          .nice()
          .range([height, 0]);
        yAccessor1 = d => d.users;
        yAccessor2 = d => d.activeUsers;
        yLabel = '用户数量（人）';
    }

    // 网格线
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat('')
      )
      .selectAll('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);

    // 坐标轴
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => d.toString()))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#4a5568');

    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickFormat(d => {
          if (viewMode === 'absolute') {
            return d >= 1000 ? (d / 1000) + 'K' : d;
          }
          return d + '%';
        }))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#4a5568');

    // 轴标签
    g.append('text')
      .attr('transform', `translate(${width/2}, ${height + 50})`)
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', '#4a5568')
      .text('年份');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -70)
      .attr('x', -(height / 2))
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', '#4a5568')
      .text(yLabel);

    // 面积生成器
    const area1 = d3.area()
      .x(d => xScale(d.year))
      .y0(height)
      .y1(d => yScale(yAccessor1(d)))
      .curve(d3.curveMonotoneX);

    const area2 = d3.area()
      .x(d => xScale(d.year))
      .y0(height)
      .y1(d => yScale(yAccessor2(d)))
      .curve(d3.curveMonotoneX);

    // 折线生成器
    const line1 = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(yAccessor1(d)))
      .curve(d3.curveMonotoneX);

    const line2 = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(yAccessor2(d)))
      .curve(d3.curveMonotoneX);

    // 渐变定义
    const defs = svgElement.append('defs');
    
    const gradient1 = defs.append('linearGradient')
      .attr('id', 'gradient1')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', height)
      .attr('x2', 0).attr('y2', 0);
    
    gradient1.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#667eea')
      .attr('stop-opacity', 0.1);
    
    gradient1.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#667eea')
      .attr('stop-opacity', 0.6);

    const gradient2 = defs.append('linearGradient')
      .attr('id', 'gradient2')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', height)
      .attr('x2', 0).attr('y2', 0);
    
    gradient2.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f093fb')
      .attr('stop-opacity', 0.1);
    
    gradient2.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f093fb')
      .attr('stop-opacity', 0.6);

    // 绘制实际数据面积图
    const totalArea = g.append('path')
      .datum(actualData)
      .attr('d', area1)
      .attr('fill', 'url(#gradient1)')
      .style('opacity', 0);

    const activeArea = g.append('path')
      .datum(actualData)
      .attr('d', area2)
      .attr('fill', 'url(#gradient2)')
      .style('opacity', 0);

    // 动画显示面积图
    totalArea.transition()
      .duration(1500)
      .style('opacity', 1);

    activeArea.transition()
      .duration(1500)
      .delay(300)
      .style('opacity', 1);

    // 绘制折线
    const totalLine = g.append('path')
      .datum(actualData)
      .attr('d', line1)
      .attr('stroke', '#667eea')
      .attr('stroke-width', 3)
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round');

    const activeLine = g.append('path')
      .datum(actualData)
      .attr('d', line2)
      .attr('stroke', '#f093fb')
      .attr('stroke-width', 3)
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round');

    // 折线动画
    [totalLine, activeLine].forEach((line, index) => {
      const totalLength = line.node().getTotalLength();
      line
        .attr('stroke-dasharray', totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(2000)
        .delay(600 + index * 300)
        .attr('stroke-dashoffset', 0);
    });

    // 绘制预测线
    // 预测功能已移除

    // 数据点
    const totalDots = g.selectAll('.dot-total')
      .data(actualData)
      .enter().append('circle')
      .attr('class', 'dot-total')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(yAccessor1(d)))
      .attr('r', 0)
      .attr('fill', '#667eea')
      .attr('stroke', 'white')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        selectedYear = d.year;
        d3.select(this).transition().duration(200).attr('r', 8);
        showTooltip(event, d);
      })
      .on('mouseout', function() {
        selectedYear = null;
        d3.select(this).transition().duration(200).attr('r', 6);
        hideTooltip();
      });

    const activeDots = g.selectAll('.dot-active')
      .data(actualData)
      .enter().append('circle')
      .attr('class', 'dot-active')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(yAccessor2(d)))
      .attr('r', 0)
      .attr('fill', '#f093fb')
      .attr('stroke', 'white')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        selectedYear = d.year;
        d3.select(this).transition().duration(200).attr('r', 8);
        showTooltip(event, d);
      })
      .on('mouseout', function() {
        selectedYear = null;
        d3.select(this).transition().duration(200).attr('r', 6);
        hideTooltip();
      });

    // 点动画
    totalDots.transition()
      .duration(500)
      .delay((d, i) => 1800 + i * 100)
      .attr('r', 6);

    activeDots.transition()
      .duration(500)
      .delay((d, i) => 2100 + i * 100)
      .attr('r', 6);

    // 预测点功能已移除

    // 事件标注功能已移除

    // 图例
    const legend = svgElement.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + margin.left + 20}, ${margin.top + 20})`);

    const legendData = [
      { color: '#667eea', label: '总用户数', type: 'actual' },
      { color: '#f093fb', label: '活跃用户数', type: 'actual' }
    ];

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`);

    legendItems.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', 'none');

    legendItems.append('text')
      .attr('x', 25)
      .attr('y', 5)
      .style('font-size', '12px')
      .style('fill', '#4a5568')
      .text(d => d.label);
  }

  function showTooltip(event, d) {
    if (tooltip) {
      tooltip.style.opacity = '1';
      tooltip.style.left = (event.pageX + 10) + 'px';
      tooltip.style.top = (event.pageY - 10) + 'px';
      
      let content = `
        <div class="tooltip-header">
          <strong>${d.year}年数据详情</strong>
        </div>
        <div class="tooltip-content">
          <div class="tooltip-section">
            <div class="tooltip-title">用户数据</div>
            <div class="tooltip-row">
              <span class="tooltip-label">总用户数:</span>
              <span class="tooltip-value">${formatNumber(d.users)} 人</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">活跃用户:</span>
              <span class="tooltip-value">${formatNumber(d.activeUsers)} 人</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">活跃率:</span>
              <span class="tooltip-value">${d.activeRate}%</span>
            </div>
          </div>
      `;

      if (viewMode !== 'absolute') {
        content += `
          <div class="tooltip-section">
            <div class="tooltip-title">增长数据</div>
            <div class="tooltip-row">
              <span class="tooltip-label">总用户增长:</span>
              <span class="tooltip-value">${d.totalGrowthRate?.toFixed(1) || '0'}%</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">活跃用户增长:</span>
              <span class="tooltip-value">${d.activeGrowthRate?.toFixed(1) || '0'}%</span>
            </div>
          </div>
        `;
      }

      content += `
          <div class="tooltip-section">
            <div class="tooltip-title">企业数据</div>
            <div class="tooltip-row">
              <span class="tooltip-label">新增企业:</span>
              <span class="tooltip-value">${formatNumber(d.count)} 家</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">累计企业:</span>
              <span class="tooltip-value">${formatNumber(d.cumulative)} 家</span>
            </div>
          </div>
        </div>
      `;

      tooltip.innerHTML = content;
    }
  }

  function hideTooltip() {
    if (tooltip) {
      tooltip.style.opacity = '0';
    }
  }

  function changeViewMode(mode) {
    viewMode = mode;
  }
</script>

<div class="user-area">
  <!-- 控制面板 -->
  <div class="controls-panel">
    <div class="view-controls">
      <span class="control-label"> </span>
      {#each Object.entries(viewModes) as [key, mode]}
        <button 
          class="view-btn"
          class:active={viewMode === key}
          on:click={() => changeViewMode(key)}
          title={mode.description}
        >
          <span class="btn-icon">{mode.icon}</span>
          <span class="btn-text">{mode.title}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- 统计概览 -->
  <div class="stats-panel">

    <div class="stat-card">
      <div class="stat-icon">⚡</div>
      <div class="stat-content">
        <div class="stat-value">{stats.avgAnnualGrowth?.toFixed(1) || '0'}%</div>
        <div class="stat-label">平均年增长率</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🏆</div>
      <div class="stat-content">
        <div class="stat-value">{stats.peakYear.year}年</div>
        <div class="stat-label">用户峰值年</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🚀</div>
      <div class="stat-content">
        <div class="stat-value">{stats.bestGrowthYear?.year || '-'}年</div>
        <div class="stat-label">最佳增长年</div>
      </div>
    </div>
  </div>

  <!-- 图表区域 -->
  <div class="chart-container">
    <div class="chart-header">
      <h3>{viewModes[viewMode].title}</h3>
      <p>{viewModes[viewMode].description}</p>
    </div>
    <svg bind:this={svg}></svg>
  </div>



</div>

<style>
  .user-area {
    width: 100%;
  }

  .controls-panel {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    flex-wrap: wrap;
    gap: 20px;
  }

  .view-controls {
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

  .view-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 20px;
    background: white;
    color: #4a5568;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 13px;
  }

  .view-btn:hover {
    border-color: #667eea;
    transform: translateY(-1px);
  }

  .view-btn.active {
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

  .feature-controls {
    display: none; /* 隐藏功能控制区域 */
  }

  .feature-btn {
    padding: 8px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 15px;
    background: white;
    color: #4a5568;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 12px;
  }

  .feature-btn:hover {
    border-color: #48bb78;
  }

  .feature-btn.active {
    background: #48bb78;
    color: white;
    border-color: transparent;
  }

  .stats-panel {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    transition: transform 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .stat-icon {
    font-size: 2rem;
    padding: 12px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2d3748;
    line-height: 1;
  }

  .stat-label {
    font-size: 13px;
    color: #718096;
    margin-top: 4px;
    font-weight: 500;
  }

  .chart-container {
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    padding: 25px;
    margin-bottom: 30px;
  }

  .chart-header {
    text-align: center;
    margin-bottom: 20px;
  }

  .chart-header h3 {
    margin: 0 0 8px 0;
    color: #2d3748;
    font-size: 1.3rem;
  }

  .chart-header p {
    margin: 0;
    color: #718096;
    font-size: 0.9rem;
  }

  .insights-panel {
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    padding: 25px;
  }

  .insights-panel h4 {
    margin: 0 0 20px 0;
    color: #2d3748;
    font-size: 1.2rem;
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .insight-card {
    padding: 20px;
    background: #f7fafc;
    border-radius: 10px;
    border-left: 4px solid #667eea;
    transition: transform 0.3s ease;
  }

  .insight-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .insight-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .insight-icon {
    font-size: 1.2rem;
  }

  .insight-title {
    font-weight: bold;
    color: #2d3748;
    font-size: 1rem;
  }

  .insight-content {
    color: #4a5568;
    font-size: 0.9rem;
    line-height: 1.5;
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
    min-width: 280px;
    max-width: 350px;
  }

  .tooltip-header {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 12px;
    border-radius: 8px 8px 0 0;
    font-weight: bold;
    text-align: center;
  }

  .tooltip-content {
    padding: 15px;
  }

  .tooltip-section {
    margin-bottom: 15px;
  }

  .tooltip-section:last-child {
    margin-bottom: 0;
  }

  .tooltip-title {
    font-weight: bold;
    color: #667eea;
    margin-bottom: 8px;
    font-size: 13px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
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

  /* 响应式设计 */
  @media (max-width: 1200px) {
    .controls-panel {
      flex-direction: column;
      align-items: stretch;
    }

    .view-controls {
      justify-content: center;
    }

    .feature-controls {
      justify-content: center;
    }

    .stats-panel {
      grid-template-columns: repeat(2, 1fr);
    }

    .insights-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .view-controls {
      flex-direction: column;
      gap: 8px;
    }

    .view-btn {
      width: 100%;
      justify-content: center;
    }

    .stats-panel {
      grid-template-columns: 1fr;
    }

    .stat-card {
      padding: 15px;
    }

    .stat-icon {
      font-size: 1.5rem;
      padding: 10px;
    }

    .stat-value {
      font-size: 1.3rem;
    }

    .chart-container {
      padding: 15px;
      overflow-x: auto;
    }

    .insights-panel {
      padding: 20px;
    }

    .insight-card {
      padding: 15px;
    }
  }

  @media (max-width: 480px) {
    .controls-panel {
      padding: 15px;
    }

    .feature-controls {
      flex-direction: column;
      gap: 8px;
    }

    .feature-btn {
      width: 100%;
    }

    .chart-container {
      padding: 12px;
    }

    .tooltip {
      min-width: 240px;
    }
  }

  /* 深色模式支持 */
  @media (prefers-color-scheme: dark) {
    .controls-panel {
      background: #2d3748;
      border-color: #4a5568;
    }

    .control-label {
      color: #e2e8f0;
    }

    .view-btn {
      background: #4a5568;
      color: #e2e8f0;
      border-color: #718096;
    }

    .stat-card {
      background: #2d3748;
      border-color: #4a5568;
    }

    .stat-value {
      color: #e2e8f0;
    }

    .stat-label {
      color: #a0aec0;
    }

    .chart-container {
      background: #2d3748;
      border-color: #4a5568;
    }

    .chart-header h3 {
      color: #e2e8f0;
    }

    .chart-header p {
      color: #a0aec0;
    }

    .insights-panel {
      background: #2d3748;
      border-color: #4a5568;
    }

    .insights-panel h4 {
      color: #e2e8f0;
    }

    .insight-card {
      background: #4a5568;
    }

    .insight-title {
      color: #e2e8f0;
    }

    .insight-content {
      color: #cbd5e0;
    }
  }
</style>