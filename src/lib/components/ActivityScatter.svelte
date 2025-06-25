<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { industryData } from '../data/industryData.js';
  import { colorScale } from '../utils/scales.js';
  import { formatNumber, formatPercent } from '../utils/formatters.js';

  let svgContainer;
  let tooltip;
  let viewMode = 'users';
  let mounted = false;

  // 视图模式配置
  const viewModes = {
    users: {
      title: '用户数 vs 活跃率',
      xLabel: '用户总数（人）',
      yLabel: '用户活跃率（%）',
      xAccessor: d => d.users,
      yAccessor: d => d.activeRate,
      sizeAccessor: d => d.companies,
      icon: '👥'
    },

  };

  onMount(() => {
    mounted = true;
    setTimeout(() => {
      createChart();
    }, 200);
  });

  $: if (mounted && svgContainer) {
    createChart();
  }

  function createChart() {
    if (!svgContainer || !mounted) return;

    // 清除之前的内容
    d3.select(svgContainer).selectAll("*").remove();

    const margin = {top: 30, right: 120, bottom: 80, left: 80};
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgContainer)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const currentMode = viewModes[viewMode];

    // 处理数据
    const data = industryData.map((d, i) => ({
      ...d,
      x: currentMode.xAccessor(d),
      y: currentMode.yAccessor(d),
      size: currentMode.sizeAccessor(d),
      color: colorScale(i)
    }));

    console.log('Data for chart:', data); // 调试输出

    // 创建比例尺
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.x)])
      .nice()
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y)])
      .nice()
      .range([height, 0]);

    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.size)])
      .range([8, 30]);

    // 添加网格线
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

    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat('')
      )
      .selectAll('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);

    // 添加坐标轴
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => {
          if (d >= 1000) return (d / 1000) + 'K';
          return d;
        }))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#4a5568');

    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickFormat(d => {
          return viewMode === 'efficiency' ? d : d + '%';
        }))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#4a5568');

    // 添加轴标签
    g.append('text')
      .attr('transform', `translate(${width/2}, ${height + 50})`)
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', '#4a5568')
      .text(currentMode.xLabel);

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -(height / 2))
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', '#4a5568')
      .text(currentMode.yLabel);

    // 创建散点
    const circles = g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => {
        console.log(`${d.name}: x=${d.x}, xScale=${xScale(d.x)}`);
        return xScale(d.x);
      })
      .attr('cy', d => {
        console.log(`${d.name}: y=${d.y}, yScale=${yScale(d.y)}`);
        return yScale(d.y);
      })
      .attr('r', 0)
      .attr('fill', d => d.color)
      .attr('opacity', 0.7)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // 添加交互
    circles
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr('opacity', 1)
          .attr('stroke', '#333')
          .attr('stroke-width', 3);
        
        showTooltip(event, d);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr('opacity', 0.7)
          .attr('stroke', 'white')
          .attr('stroke-width', 2);
        
        hideTooltip();
      });

    // 动画显示散点
    circles.transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('r', d => sizeScale(d.size));

    // 添加标签
    g.selectAll('.label')
      .data(data)
      .enter().append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.x))
      .attr('y', d => yScale(d.y) - sizeScale(d.size) - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#4a5568')
      .style('opacity', 0)
      .text(d => d.name)
      .transition()
      .duration(600)
      .delay((d, i) => i * 100 + 400)
      .style('opacity', 1);

    // 添加图例
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + margin.left + 20}, ${margin.top + 20})`);

    legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#4a5568')
      .text('气泡大小:');

    const sizeExample = currentMode.sizeAccessor === (d => d.companies) ? '企业数' :
                       currentMode.sizeAccessor === (d => d.users) ? '用户数' : '设备数';

    legend.append('text')
      .attr('x', 0)
      .attr('y', 20)
      .style('font-size', '12px')
      .style('fill', '#718096')
      .text(sizeExample);

    // 示例气泡
    const legendData = [
      { size: 12, label: '小' },
      { size: 20, label: '中' },
      { size: 28, label: '大' }
    ];

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${40 + i * 35})`);

    legendItems.append('circle')
      .attr('cx', 15)
      .attr('cy', 0)
      .attr('r', d => d.size)
      .attr('fill', '#667eea')
      .attr('opacity', 0.6)
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    legendItems.append('text')
      .attr('x', 35)
      .attr('y', 5)
      .style('font-size', '12px')
      .style('fill', '#4a5568')
      .text(d => d.label);
  }

  function showTooltip(event, d) {
    if (!tooltip) return;
    
    tooltip.style.opacity = '1';
    tooltip.style.left = (event.pageX + 10) + 'px';
    tooltip.style.top = (event.pageY - 10) + 'px';
    tooltip.innerHTML = `
      <div class="tooltip-header">
        <strong>${d.name}行业</strong>
      </div>
      <div class="tooltip-content">
        <div class="tooltip-row">
          <span class="tooltip-label">企业数量:</span>
          <span class="tooltip-value">${formatNumber(d.companies)} 家</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">用户总数:</span>
          <span class="tooltip-value">${formatNumber(d.users)} 人</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">活跃用户:</span>
          <span class="tooltip-value">${formatNumber(d.activeUsers)} 人</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">活跃率:</span>
          <span class="tooltip-value">${formatPercent(d.activeRate)}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">设备总数:</span>
          <span class="tooltip-value">${formatNumber(d.devices)} 台</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">用户密度:</span>
          <span class="tooltip-value">${Math.round(d.users / d.companies)} 人/企业</span>
        </div>
      </div>
    `;
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

<div class="activity-scatter">
  <!-- 控制面板 -->
  <div class="controls-panel">
    <div class="view-controls">
      <span class="control-label">视图模式:</span>
      {#each Object.entries(viewModes) as [key, mode]}
        <button 
          class="view-btn"
          class:active={viewMode === key}
          on:click={() => changeViewMode(key)}
        >
          <span class="btn-icon">{mode.icon}</span>
          <span class="btn-text">{mode.title}</span>
        </button>
      {/each}
    </div>

    <div class="info-panel">
      <div class="info-item">
        <span class="info-label">当前视图:</span>
        <span class="info-value">{viewModes[viewMode].title}</span>
      </div>
      <div class="info-item">
        <span class="info-label">行业数量:</span>
        <span class="info-value">{industryData.length}</span>
      </div>
    </div>
  </div>

  <!-- 图表区域 -->
  <div class="chart-container">
    <div bind:this={svgContainer} class="svg-container"></div>
  </div>

  <!-- 数据表格 -->
  <div class="data-table">
    <div class="table-header">
      <h4>详细数据 - {viewModes[viewMode].title}</h4>
    </div>
    <div class="table-content">
      <div class="table-row table-head">
        <div class="table-cell">行业</div>
        <div class="table-cell">企业数</div>
        <div class="table-cell">用户数</div>
        <div class="table-cell">活跃率</div>
        <div class="table-cell">设备数</div>
        <div class="table-cell">用户密度</div>
      </div>
      {#each industryData as item, index}
        <div class="table-row">
          <div class="table-cell industry">
            <div class="color-dot" style="background-color: {colorScale(index)}"></div>
            {item.name}
          </div>
          <div class="table-cell">{formatNumber(item.companies)}</div>
          <div class="table-cell">{formatNumber(item.users)}</div>
          <div class="table-cell active-rate">{formatPercent(item.activeRate)}</div>
          <div class="table-cell">{formatNumber(item.devices)}</div>
          <div class="table-cell">{Math.round(item.users / item.companies)}</div>
        </div>
      {/each}
    </div>
  </div>
<!-- 新增：活跃度洞察 -->
  <div class="activity-insights">
    <h4 class="insights-title">🎯 用户活跃度洞察</h4>
    <div class="quadrant-analysis">

      <div class="quadrants">
        <div class="quadrant high-user-high-active">
    
          <p><strong>鞋服</strong>：用户规模大且活跃度高，是平台的核心价值行业</p>
        </div>
        <div class="quadrant low-user-high-active">
          <h6> 潜力行业</h6>
          <p><strong>医美、医药</strong>：用户基数小但活跃度极高，具有高价值用户特征</p>
        </div>
        <div class="quadrant high-user-low-active">
          <h6>待激活行业</h6>
          <p><strong>家居、汽车</strong>：用户基数大但活跃度偏低，需要重点运营</p>
        </div>

      </div>
    </div>

  </div>
  <div class="tooltip" bind:this={tooltip}></div>
</div>

<style>
  .activity-scatter {
    width: 100%;
  }

  .controls-panel {
    display: flex;
    justify-content: space-between;
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

  .info-panel {
    display: flex;
    gap: 20px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .info-label {
    font-size: 12px;
    color: #718096;
    margin-bottom: 4px;
  }

  .info-value {
    font-size: 14px;
    font-weight: bold;
    color: #2d3748;
  }

  .chart-container {
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    padding: 20px;
    margin-bottom: 30px;
    min-height: 600px;
  }

  .svg-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
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

  .table-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
  }

  .table-content {
    max-height: 400px;
    overflow-y: auto;
  }

  .table-row {
    display: grid;
    grid-template-columns: 120px 100px 120px 100px 120px 100px;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid #e2e8f0;
    transition: background-color 0.2s ease;
  }

  .table-row:hover {
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

  .table-cell.active-rate {
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
    min-width: 240px;
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

  /* 响应式设计 */
  @media (max-width: 1200px) {
    .controls-panel {
      flex-direction: column;
      align-items: stretch;
    }

    .view-controls {
      justify-content: center;
    }

    .info-panel {
      justify-content: center;
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

    .table-row {
      grid-template-columns: 1fr;
      gap: 4px;
      text-align: center;
    }

    .table-head {
      display: none;
    }

    .chart-container {
      padding: 15px;
      min-height: 500px;
    }
  }
  /* 分析结论通用样式 */
  .insights-section,
  .analysis-conclusion,
  .distribution-analysis,
  .trend-analysis,
  .activity-insights,
  .deployment-analysis,
  .growth-insights {
    margin-top: 30px;
    padding: 25px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    border: 1px solid #e2e8f0;
    backdrop-filter: blur(10px);
  }

  .insights-title,
  .conclusion-title,
  .analysis-title {
    font-size: 1.3rem;
    font-weight: bold;
    color: #4a5568;
    margin-bottom: 20px;
    text-align: center;
    padding-bottom: 10px;
    border-bottom: 2px solid #e2e8f0;
  }

  .insight-item,
  .conclusion-card {
    padding: 15px;
    background: #f8fafc;
    border-radius: 10px;
    margin-bottom: 12px;
    border-left: 4px solid #667eea;
  }

  .finding-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: white;
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .highlight {
    border-left: 3px solid #f56565;
    background: #fff5f5;
  }
</style>