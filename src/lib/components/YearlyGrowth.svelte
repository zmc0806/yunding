<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { yearlyData } from '../data/industryData.js';
  import { formatNumber, formatPercent } from '../utils/formatters.js';

  let svg;
  let tooltip;
  let activeMode = 'new';

  // 模式配置
  const modeConfig = {
    new: {
      label: '新增企业',
      icon: '📈',
      color: '#667eea',
      accessor: d => d.count,
      yLabel: '新增企业数（家）',
      chartType: 'bar'
    },
    cumulative: {
      label: '累计企业',
      icon: '📊',
      color: '#764ba2',
      accessor: d => d.cumulative,
      yLabel: '累计企业数（家）',
      chartType: 'line'
    },
    activeRate: {
      label: '活跃率',
      icon: '🎯',
      color: '#f5576c',
      accessor: d => d.activeRate,
      yLabel: '用户活跃率（%）',
      chartType: 'bar'
    }
  };

  onMount(() => {
    drawChart();
  });

  function switchMode(mode) {
    activeMode = mode;
    drawChart();
  }

  function drawChart() {
    d3.select(svg).selectAll("*").remove();

    const margin = {top: 20, right: 50, bottom: 50, left: 100}; // 增加左边距
    const width = 800 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svgElement = d3.select(svg)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svgElement.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const config = modeConfig[activeMode];
    const xScale = d3.scaleBand()
      .domain(yearlyData.map(d => d.year))
      .range([0, width])
      .padding(0.15); // 减少padding让柱子更宽

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(yearlyData, config.accessor)])
      .nice()
      .range([height, 0]);

    // 添加网格线
    const gridLines = g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, 0)`)
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat('')
      );

    gridLines.selectAll('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);

    // X轴
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => d))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', '500');

    // Y轴
    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickFormat(d => {
          if (activeMode === 'activeRate') {
            return d + '%';
          }
          return d >= 1000 ? (d / 1000) + 'K' : d;
        }))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', '500');

    // Y轴标签 - 调整位置避免遮挡
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -80) // 增加距离
      .attr('x', -(height / 2))
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', '#4a5568')
      .text(config.yLabel);

    // X轴标签
    g.append('text')
      .attr('transform', `translate(${width/2}, ${height + 40})`)
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', '#4a5568')
      .text('年份');

    if (config.chartType === 'bar') {
      // 柱状图
      const bars = g.selectAll('.bar')
        .data(yearlyData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.year))
        .attr('width', xScale.bandwidth())
        .attr('y', height)
        .attr('height', 0)
        .attr('rx', 4) // 圆角
        .attr('ry', 4)
        .attr('fill', config.color)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition().duration(200)
            .attr('fill', d3.color(config.color).brighter(0.3));
          showTooltip(event, d, config);
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .transition().duration(200)
            .attr('fill', config.color);
          hideTooltip();
        });

      // 柱状图动画
      bars.transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr('y', d => yScale(config.accessor(d)))
        .attr('height', d => height - yScale(config.accessor(d)));

      // 添加数值标签
      g.selectAll('.bar-label')
        .data(yearlyData)
        .enter().append('text')
        .attr('class', 'bar-label')
        .attr('x', d => xScale(d.year) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(config.accessor(d)) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#4a5568')
        .style('opacity', 0)
        .text(d => {
          const value = config.accessor(d);
          return activeMode === 'activeRate' ? value + '%' : value;
        })
        .transition()
        .duration(800)
        .delay((d, i) => i * 100 + 400)
        .style('opacity', 1);

    } else {
      // 折线图（累计企业）
      const line = d3.line()
        .x(d => xScale(d.year) + xScale.bandwidth() / 2)
        .y(d => yScale(config.accessor(d)))
        .curve(d3.curveMonotoneX);

      // 添加面积填充
      const area = d3.area()
        .x(d => xScale(d.year) + xScale.bandwidth() / 2)
        .y0(height)
        .y1(d => yScale(config.accessor(d)))
        .curve(d3.curveMonotoneX);

      // 面积图
      const areaPath = g.append('path')
        .datum(yearlyData)
        .attr('d', area)
        .attr('fill', config.color)
        .attr('opacity', 0.2);

      // 折线
      const linePath = g.append('path')
        .datum(yearlyData)
        .attr('d', line)
        .attr('stroke', config.color)
        .attr('stroke-width', 3)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');

      // 线条动画
      const totalLength = linePath.node().getTotalLength();
      linePath
        .attr('stroke-dasharray', totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1500)
        .attr('stroke-dashoffset', 0);

      // 数据点
      const dots = g.selectAll('.dot')
        .data(yearlyData)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(d.year) + xScale.bandwidth() / 2)
        .attr('cy', d => yScale(config.accessor(d)))
        .attr('r', 0)
        .attr('fill', config.color)
        .attr('stroke', 'white')
        .attr('stroke-width', 3)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition().duration(200)
            .attr('r', 8);
          showTooltip(event, d, config);
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .transition().duration(200)
            .attr('r', 5);
          hideTooltip();
        });

      // 点动画
      dots.transition()
        .duration(500)
        .delay((d, i) => 1200 + i * 100)
        .attr('r', 5);

      // 数值标签
      g.selectAll('.line-label')
        .data(yearlyData)
        .enter().append('text')
        .attr('class', 'line-label')
        .attr('x', d => xScale(d.year) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(config.accessor(d)) - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#4a5568')
        .style('opacity', 0)
        .text(d => config.accessor(d))
        .transition()
        .duration(500)
        .delay((d, i) => 1500 + i * 100)
        .style('opacity', 1);
    }
  }

  function showTooltip(event, d, config) {
    if (tooltip) {
      tooltip.style.opacity = '1';
      tooltip.style.left = (event.pageX + 10) + 'px';
      tooltip.style.top = (event.pageY - 10) + 'px';
      
      const value = config.accessor(d);
      const formattedValue = activeMode === 'activeRate' ? 
        formatPercent(value) : 
        formatNumber(value) + '家';

      tooltip.innerHTML = `
        <div class="tooltip-header">
          <strong>${d.year}年</strong>
        </div>
        <div class="tooltip-content">
          <div class="tooltip-row">
            <span class="tooltip-label">${config.label}:</span>
            <span class="tooltip-value">${formattedValue}</span>
          </div>
          ${activeMode !== 'activeRate' ? `
            <div class="tooltip-row">
              <span class="tooltip-label">活跃率:</span>
              <span class="tooltip-value">${formatPercent(d.activeRate)}</span>
            </div>
          ` : ''}
        </div>
      `;
    }
  }

  function hideTooltip() {
    if (tooltip) {
      tooltip.style.opacity = '0';
    }
  }
</script>

<div class="yearly-growth">
  <!-- 控制按钮区域 -->
  <div class="controls">
    {#each Object.entries(modeConfig) as [key, config]}
      <button 
        class="control-btn"
        class:active={activeMode === key}
        on:click={() => switchMode(key)}
      >
        <span class="btn-icon">{config.icon}</span>
        <span class="btn-text">{config.label}</span>
      </button>
    {/each}
  </div>

  <!-- 图表区域 -->
  <div class="chart-wrapper">
    <svg bind:this={svg}></svg>
  </div>

  <!-- 数据概览 -->
  <div class="data-summary">
    <div class="summary-item">
      <span class="summary-label">时间跨度:</span>
      <span class="summary-value">2017-2025年</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">数据点:</span>
      <span class="summary-value">{yearlyData.length}个年份</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">当前视图:</span>
      <span class="summary-value">{modeConfig[activeMode].label}</span>
    </div>
  </div>

  <div class="tooltip" bind:this={tooltip}></div>
</div>

<style>
  .yearly-growth {
    width: 100%;
  }

  .controls {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }

  .control-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: 2px solid #e2e8f0;
    border-radius: 25px;
    background: white;
    color: #4a5568;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .control-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-color: #667eea;
  }

  .control-btn.active {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .btn-icon {
    font-size: 16px;
  }

  .btn-text {
    font-size: 14px;
  }

  .chart-wrapper {
    display: flex;
    justify-content: center;
    background: #fafbfc;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #e2e8f0;
  }

  .data-summary {
    display: flex;
    justify-content: center;
    gap: 30px;
    padding: 15px;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
  }

  .summary-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .summary-label {
    font-size: 13px;
    color: #718096;
    font-weight: 500;
  }

  .summary-value {
    font-size: 13px;
    color: #2d3748;
    font-weight: 600;
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
    min-width: 200px;
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
  @media (max-width: 1024px) {
    .chart-wrapper {
      padding: 15px;
    }
    
    .chart-wrapper svg {
      width: 100% !important;
      height: auto !important;
    }
  }

  @media (max-width: 768px) {
    .controls {
      gap: 12px;
    }

    .control-btn {
      padding: 10px 16px;
      font-size: 13px;
    }

    .btn-icon {
      font-size: 14px;
    }

    .btn-text {
      font-size: 13px;
    }

    .data-summary {
      flex-direction: column;
      gap: 10px;
      align-items: center;
    }

    .chart-wrapper {
      padding: 10px;
    }
  }

  @media (max-width: 480px) {
    .controls {
      flex-direction: column;
      align-items: center;
    }

    .control-btn {
      width: 200px;
      justify-content: center;
    }
  }
</style>