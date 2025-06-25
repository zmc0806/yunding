<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { industryData } from '../data/industryData.js';
  import { colorScale } from '../utils/scales.js';
  import { formatNumber } from '../utils/formatters.js';

  let svg;
  let tooltip;
  let selectedIndex = -1; // 用于高亮选中的行业

  // 计算总企业数
  const totalCompanies = industryData.reduce((sum, d) => sum + d.companies, 0);

  // 为数据添加百分比
  const enrichedData = industryData.map((d, i) => ({
    ...d,
    percentage: ((d.companies / totalCompanies) * 100).toFixed(1),
    color: colorScale(i)
  }));

  onMount(() => {
    createDonutChart();
  });

  function createDonutChart() {
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 40;

    const svgElement = d3.select(svg)
      .attr('width', width)
      .attr('height', height);

    const g = svgElement.append('g')
      .attr('transform', `translate(${width/2}, ${height/2})`);

    const pie = d3.pie()
      .value(d => d.companies)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(radius * 0.4)
      .outerRadius(radius);

    const arcHover = d3.arc()
      .innerRadius(radius * 0.35) // 内圈稍微缩小
      .outerRadius(radius * 1.05); // 外圈稍微放大

    const arcs = g.selectAll('.arc')
      .data(pie(enrichedData))
      .enter().append('g')
      .attr('class', 'arc');

    // 饼图路径
    const paths = arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr('d', arcHover);
        
        selectedIndex = enrichedData.findIndex(item => item.name === d.data.name);
        showTooltip(event, d);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr('d', arc);
        
        selectedIndex = -1;
        hideTooltip();
      });

    // 添加所有标签（不再根据百分比过滤）
    arcs.append('text')
      .attr('transform', d => {
        const centroid = arc.centroid(d);
        // 对于小扇形，将标签向外移动
        const angle = (d.startAngle + d.endAngle) / 2;
        const labelRadius = radius * 0.8; // 标签距离中心的比例
        const x = Math.cos(angle - Math.PI/2) * labelRadius;
        const y = Math.sin(angle - Math.PI/2) * labelRadius;
        return `translate(${x}, ${y})`;
      })
      .attr('text-anchor', 'middle')
      .attr('font-size', d => {
        // 根据扇形大小调整字体大小
        const percentage = (d.data.companies / totalCompanies) * 100;
        return percentage > 8 ? '12px' : '10px';
      })
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
      .text(d => d.data.name);

    // 动画效果
    paths.style('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .style('opacity', 1);
  }

  function showTooltip(event, d) {
    if (tooltip) {
      tooltip.style.opacity = '1';
      tooltip.style.left = (event.pageX + 10) + 'px';
      tooltip.style.top = (event.pageY - 10) + 'px';
      tooltip.innerHTML = `
        <strong>${d.data.name}</strong><br/>
        企业数: ${formatNumber(d.data.companies)}<br/>
        占比: ${d.data.percentage}%<br/>
        用户数: ${formatNumber(d.data.users)}<br/>
        活跃率: ${d.data.activeRate}%
      `;
    }
  }

  function hideTooltip() {
    if (tooltip) {
      tooltip.style.opacity = '0';
    }
  }

  function handleItemHover(index) {
    selectedIndex = index;
    // 高亮对应的饼图扇形
    if (svg) {
      d3.select(svg)
        .selectAll('.arc path')
        .transition()
        .duration(200)
        .attr('opacity', (d, i) => i === index ? 1 : 0.6);
    }
  }

  function handleItemLeave() {
    selectedIndex = -1;
    // 恢复所有扇形的透明度
    if (svg) {
      d3.select(svg)
        .selectAll('.arc path')
        .transition()
        .duration(200)
        .attr('opacity', 1);
    }
  }
  
</script>

<div class="industry-distribution">
  <!-- 左侧：环形图 -->
  <div class="chart-section">
    <svg bind:this={svg}></svg>
    <div class="chart-center-info">
      <div class="total-number">{formatNumber(totalCompanies)}</div>
      <div class="total-label">总企业数</div>
    </div>
  </div>

  <!-- 右侧：数据列表 -->
  <div class="data-section">
    <div class="data-header">
      <h4>行业分布详情</h4>
      <p class="data-summary">共 {enrichedData.length} 个行业领域</p>
    </div>
    
    <div class="data-list">
      {#each enrichedData as item, index}
        <div 
          class="data-item"
          class:selected={selectedIndex === index}
          on:mouseenter={() => handleItemHover(index)}
          on:mouseleave={handleItemLeave}
        >
          <div class="item-header">
            <div class="color-indicator" style="background-color: {item.color}"></div>
            <span class="industry-name">{item.name}</span>
            <span class="percentage">{item.percentage}%</span>
          </div>
          
          <div class="item-details">
            <div class="detail-row">
              <span class="label">企业数量:</span>
              <span class="value">{formatNumber(item.companies)} 家</span>
            </div>
            <div class="detail-row">
              <span class="label">用户总数:</span>
              <span class="value">{formatNumber(item.users)} 人</span>
            </div>
            <div class="detail-row">
              <span class="label">活跃用户:</span>
              <span class="value">{formatNumber(item.activeUsers)} 人</span>
            </div>
            <div class="detail-row">
              <span class="label">活跃率:</span>
              <span class="value active-rate">{item.activeRate}%</span>
            </div>
          </div>
          
          <!-- 进度条显示占比 -->
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              style="width: {item.percentage}%; background-color: {item.color};"
            ></div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- 新增：分布分析 -->
<div class="distribution-analysis">
  <div class="analysis-header">
    <h4>📊 行业分布分析</h4>
  </div>
  <div class="analysis-content">
    <div class="key-findings">
      <div class="finding-item highlight">
        <span class="finding-label">市场集中度</span>
        <span class="finding-value">前三大行业占比 64.9%</span>
      </div>
      <div class="finding-item">
        <span class="finding-label">头部效应</span>
        <span class="finding-value">鞋服行业一家独大，占比 39.8%</span>
      </div>
    </div>
    <div class="insights-text">
      <p><strong>集中化趋势明显：</strong>鞋服行业以262家企业领跑。餐饮、家居紧随其后。</p>
      <p><strong>新兴领域机会：</strong>潮玩、医美、摩托等新兴细分领域虽占比较小，但增长潜力大。</p>
    </div>
  </div>
</div>

  <div class="tooltip" bind:this={tooltip}></div>
</div>

<style>
  .industry-distribution {
    display: flex;
    gap: 40px;
    align-items: flex-start;
    min-height: 400px;
  }

  /* 左侧图表区域 */
  .chart-section {
    position: relative;
    flex: 0 0 400px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .chart-center-info {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none;
  }

  .total-number {
    font-size: 2.5rem;
    font-weight: bold;
    color: #667eea;
    line-height: 1;
  }

  .total-label {
    font-size: 0.9rem;
    color: #666;
    margin-top: 5px;
    font-weight: 600;
  }

  /* 右侧数据区域 */
  .data-section {
    flex: 1;
    min-width: 0;
  }

  .data-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #e2e8f0;
  }

  .data-header h4 {
    margin: 0 0 8px 0;
    font-size: 1.3rem;
    color: #4a5568;
    font-weight: bold;
  }

  .data-summary {
    margin: 0;
    color: #718096;
    font-size: 0.9rem;
  }

  .data-list {
    max-height: 500px;
    overflow-y: auto;
    padding-right: 10px;
  }

  .data-item {
    background: #f8fafc;
    border: 2px solid transparent;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .data-item:hover,
  .data-item.selected {
    background: #fff;
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    transform: translateX(5px);
  }

  .item-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  .color-indicator {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 12px;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .industry-name {
    font-weight: bold;
    color: #2d3748;
    flex: 1;
    font-size: 1.1rem;
  }

  .percentage {
    font-weight: bold;
    color: #667eea;
    font-size: 1.1rem;
  }

  .item-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
    margin-bottom: 12px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-row .label {
    font-size: 0.85rem;
    color: #718096;
    font-weight: 500;
  }

  .detail-row .value {
    font-size: 0.9rem;
    color: #2d3748;
    font-weight: 600;
  }

  .detail-row .active-rate {
    color: #48bb78;
    font-weight: bold;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: #e2e8f0;
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    transition: width 0.8s ease;
    border-radius: 3px;
  }

  .tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px;
    border-radius: 8px;
    font-size: 12px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  /* 滚动条样式 */
  .data-list::-webkit-scrollbar {
    width: 6px;
  }

  .data-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .data-list::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .data-list::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* 响应式设计 */
  @media (max-width: 1200px) {
    .industry-distribution {
      flex-direction: column;
      gap: 30px;
    }

    .chart-section {
      flex: none;
      align-self: center;
    }

    .item-details {
      grid-template-columns: 1fr;
      gap: 6px;
    }
  }

  @media (max-width: 768px) {
    .chart-section {
      flex: 0 0 300px;
    }

    .chart-section svg {
      width: 300px !important;
      height: 300px !important;
    }

    .total-number {
      font-size: 2rem;
    }

    .industry-distribution {
      gap: 20px;
    }

    .data-item {
      padding: 12px;
    }

    .industry-name {
      font-size: 1rem;
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