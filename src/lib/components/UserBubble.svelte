<script>
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import { industryData } from '../data/industryData.js';
  import { colorScale } from '../utils/scales.js';
  import { formatNumber, formatPercent } from '../utils/formatters.js';

  let svg;
  let tooltip;
  let simulation;
  let container;
  let mounted = false;

  // 数据预处理
  const bubbleData = industryData.map((d, i) => ({
    ...d,
    id: `bubble-${i}`,
    color: colorScale(i),
    radius: Math.sqrt(d.users) / 20 + 10, // 调整气泡大小
    x: Math.random() * 400 + 200, // 随机初始位置
    y: Math.random() * 300 + 150,
  }));

  // 统计信息
  const stats = {
    totalUsers: industryData.reduce((sum, d) => sum + d.users, 0),
    avgUsers: Math.round(industryData.reduce((sum, d) => sum + d.users, 0) / industryData.length),
    maxUsers: Math.max(...industryData.map(d => d.users)),
    minUsers: Math.min(...industryData.map(d => d.users))
  };

  onMount(() => {
    mounted = true;
    // 延迟一点再创建图表，确保DOM已经准备好
    setTimeout(() => {
      createBubbleChart();
    }, 100);
  });

  onDestroy(() => {
    if (simulation) {
      simulation.stop();
    }
  });

  function createBubbleChart() {
    if (!svg || !mounted) return;
    
    // 清除之前的内容
    d3.select(svg).selectAll("*").remove();

    const width = 800;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;

    const svgElement = d3.select(svg)
      .attr('width', width)
      .attr('height', height)
      .style('background', '#fafbfc');

    // 创建主容器组
    const g = svgElement.append('g');

    // 创建力导向模拟
    simulation = d3.forceSimulation(bubbleData)
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collision', d3.forceCollide().radius(d => d.radius + 2))
      .force('x', d3.forceX(centerX).strength(0.1))
      .force('y', d3.forceY(centerY).strength(0.1));

    // 创建气泡
    const bubbles = g.selectAll('.bubble')
      .data(bubbleData)
      .enter().append('circle')
      .attr('class', 'bubble')
      .attr('id', d => d.id)
      .attr('r', 0) // 初始半径为0，用于动画
      .attr('fill', d => d.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .style('opacity', 0.8)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr('r', d.radius + 5)
          .style('opacity', 1)
          .attr('stroke-width', 4);
        
        showTooltip(event, d);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr('r', d.radius)
          .style('opacity', 0.8)
          .attr('stroke-width', 3);
        
        hideTooltip();
      });

    // 气泡出现动画
    bubbles.transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('r', d => d.radius);

    // 创建标签
    const labels = g.selectAll('.bubble-label')
      .data(bubbleData)
      .enter().append('text')
      .attr('class', 'bubble-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('font-size', d => Math.max(10, d.radius / 3) + 'px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .text(d => d.name);

    // 标签出现动画
    labels.transition()
      .duration(800)
      .delay((d, i) => i * 100 + 500)
      .style('opacity', 1);

    // 更新位置
    simulation.on('tick', () => {
      bubbles
        .attr('cx', d => Math.max(d.radius, Math.min(width - d.radius, d.x)))
        .attr('cy', d => Math.max(d.radius, Math.min(height - d.radius, d.y)));
      
      labels
        .attr('x', d => Math.max(d.radius, Math.min(width - d.radius, d.x)))
        .attr('y', d => Math.max(d.radius, Math.min(height - d.radius, d.y)));
    });

    // 添加图例
    const legend = svgElement.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(20, 20)`);

    legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#4a5568')
      .text('气泡大小 = 用户规模');

    // 添加示例气泡
    const legendBubbles = [
      { size: 15, label: '小规模', users: 1000 },
      { size: 25, label: '中规模', users: 5000 },
      { size: 35, label: '大规模', users: 10000 }
    ];

    const legendItems = legend.selectAll('.legend-item')
      .data(legendBubbles)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${30 + i * 50})`);

    legendItems.append('circle')
      .attr('cx', 20)
      .attr('cy', 0)
      .attr('r', d => d.size)
      .attr('fill', '#667eea')
      .attr('opacity', 0.6)
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    legendItems.append('text')
      .attr('x', 50)
      .attr('y', -5)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#4a5568')
      .text(d => d.label);

    legendItems.append('text')
      .attr('x', 50)
      .attr('y', 10)
      .style('font-size', '11px')
      .style('fill', '#718096')
      .text(d => `~${formatNumber(d.users)}用户`);
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
            <span class="tooltip-label">企业数量:</span>
            <span class="tooltip-value">${formatNumber(d.companies)} 家</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">平均用户/企业:</span>
            <span class="tooltip-value">${Math.round(d.users / d.companies)} 人</span>
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

  function restartSimulation() {
    if (simulation) {
      simulation.alpha(0.3).restart();
    }
  }
</script>

<div class="user-bubble" bind:this={container}>
  <!-- 控制面板 -->
  <div class="controls-panel">
    <div class="panel-left">
      <h3 class="panel-title">用户规模分布分析</h3>
      <p class="panel-description">气泡大小代表用户规模，颜色区分不同行业</p>
    </div>
    
    <div class="panel-right">
      <button class="refresh-btn" on:click={restartSimulation}>
        <span class="btn-icon">🔄</span>
        <span class="btn-text">重新排列</span>
      </button>
    </div>
  </div>

  <!-- 统计概览 -->
  <div class="stats-bar">
    <div class="stat-item">
      <span class="stat-value">{formatNumber(stats.totalUsers)}</span>
      <span class="stat-label">用户总数</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{formatNumber(stats.avgUsers)}</span>
      <span class="stat-label">平均规模</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{formatNumber(stats.maxUsers)}</span>
      <span class="stat-label">最大规模</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{industryData.length}</span>
      <span class="stat-label">行业数量</span>
    </div>
  </div>

  <!-- 图表区域 -->
  <div class="chart-container">
    <svg bind:this={svg}></svg>
  </div>

  <!-- 数据列表 -->
  <div class="data-list">
    <div class="list-header">
      <h4>行业用户规模排行</h4>
    </div>
    <div class="list-content">
      {#each bubbleData.sort((a, b) => b.users - a.users) as item, index}
        <div class="list-item">
          <div class="item-rank">#{index + 1}</div>
          <div class="item-info">
            <div class="item-name">
              <div class="color-indicator" style="background-color: {item.color}"></div>
              {item.name}
            </div>
            <div class="item-stats">
              <span class="users">{formatNumber(item.users)} 用户</span>
              <span class="companies">{formatNumber(item.companies)} 企业</span>
              <span class="avg">{Math.round(item.users / item.companies)} 人/企业</span>
            </div>
          </div>
          <div class="item-percentage">
            {((item.users / stats.totalUsers) * 100).toFixed(1)}%
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="tooltip" bind:this={tooltip}></div>
</div>

<style>
  .user-bubble {
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
  }

  .panel-left h3 {
    margin: 0 0 5px 0;
    color: #2d3748;
    font-size: 1.2rem;
  }

  .panel-left p {
    margin: 0;
    color: #718096;
    font-size: 0.9rem;
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: 2px solid #667eea;
    border-radius: 25px;
    background: white;
    color: #667eea;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .refresh-btn:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
  }

  .btn-icon {
    font-size: 16px;
  }

  .btn-text {
    font-size: 14px;
  }

  .stats-bar {
    display: flex;
    justify-content: space-around;
    padding: 15px;
    background: white;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    margin-bottom: 20px;
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
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    margin-bottom: 30px;
    display: flex;
    justify-content: center;
    overflow: hidden;
  }

  .data-list {
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }

  .list-header {
    padding: 16px 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
  }

  .list-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
  }

  .list-content {
    max-height: 400px;
    overflow-y: auto;
  }

  .list-item {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #e2e8f0;
    transition: background-color 0.2s ease;
  }

  .list-item:hover {
    background: #f7fafc;
  }

  .item-rank {
    font-size: 18px;
    font-weight: bold;
    color: #667eea;
    margin-right: 15px;
    min-width: 40px;
  }

  .item-info {
    flex: 1;
  }

  .item-name {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 5px;
  }

  .color-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .item-stats {
    display: flex;
    gap: 15px;
    font-size: 13px;
  }

  .item-stats .users {
    color: #667eea;
    font-weight: 600;
  }

  .item-stats .companies {
    color: #48bb78;
    font-weight: 500;
  }

  .item-stats .avg {
    color: #718096;
    font-weight: 500;
  }

  .item-percentage {
    font-size: 16px;
    font-weight: bold;
    color: #f56565;
    min-width: 60px;
    text-align: right;
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
  @media (max-width: 768px) {
    .controls-panel {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }

    .stats-bar {
      flex-direction: column;
      gap: 10px;
    }

    .list-item {
      flex-direction: column;
      gap: 10px;
      text-align: center;
    }

    .item-stats {
      justify-content: center;
    }
  }
</style>