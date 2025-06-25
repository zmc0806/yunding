<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { formatNumber, formatPercent } from '../utils/formatters.js';
  import { colorScale } from '../utils/scales.js';

  let svgContainer;
  let viewMode = 'pure-scale'; // pure-scale, industry-scale, efficiency
  let selectedScale = null;

  // 基础行业数据
  const industryData = [
    {industry: '鞋服', companies: 262, users: 25452, activeUsers: 11778, devices: 107996, stores: 19104, marketShare: 39.8, activeRate: 46.3, companyFlowRate: 51.5, storeFlowRate: 49.5},
    {industry: '餐饮', companies: 117, users: 8376, activeUsers: 3834, devices: 31288, stores: 8120, marketShare: 17.8, activeRate: 45.8, companyFlowRate: 8.5, storeFlowRate: 0.3},
    {industry: '家居', companies: 28, users: 4253, activeUsers: 663, devices: 38107, stores: 9287, marketShare: 4.3, activeRate: 15.6, companyFlowRate: 39.3, storeFlowRate: 2.3},
    {industry: '商超', companies: 24, users: 2437, activeUsers: 1143, devices: 8590, stores: 1956, marketShare: 3.6, activeRate: 46.9, companyFlowRate: 33.3, storeFlowRate: 2.4},
    {industry: '其他', companies: 23, users: 198, activeUsers: 26, devices: 352, stores: 156, marketShare: 3.5, activeRate: 13.1, companyFlowRate: 34.8, storeFlowRate: 17.3},
    {industry: '3C', companies: 22, users: 1611, activeUsers: 491, devices: 3707, stores: 4166, marketShare: 3.3, activeRate: 30.5, companyFlowRate: 40.9, storeFlowRate: 6.4},
    {industry: '珠宝', companies: 21, users: 2726, activeUsers: 588, devices: 8922, stores: 3087, marketShare: 3.2, activeRate: 21.6, companyFlowRate: 33.3, storeFlowRate: 12.6},
    {industry: '百货店', companies: 21, users: 278, activeUsers: 68, devices: 787, stores: 160, marketShare: 3.2, activeRate: 24.5, companyFlowRate: 52.4, storeFlowRate: 16.9},
    {industry: '汽车', companies: 17, users: 2681, activeUsers: 121, devices: 3189, stores: 1171, marketShare: 2.6, activeRate: 4.5, companyFlowRate: 23.5, storeFlowRate: 1.4},
    {industry: '建筑', companies: 9, users: 1700, activeUsers: 707, devices: 13410, stores: 2528, marketShare: 1.4, activeRate: 41.6, companyFlowRate: 22.2, storeFlowRate: 1.2},
    {industry: '生鲜', companies: 3, users: 5851, activeUsers: 338, devices: 8809, stores: 2847, marketShare: 0.5, activeRate: 5.8, companyFlowRate: 33.3, storeFlowRate: 3.2},
    {industry: '摩托', companies: 3, users: 1324, activeUsers: 961, devices: 10669, stores: 1187, marketShare: 0.5, activeRate: 72.6, companyFlowRate: 33.3, storeFlowRate: 5.6}
  ];

  // 门店规模分级定义
  const scaleDefinitions = [
    {
      id: 'small',
      label: '小规模',
      range: '101-500店',
      min: 101,
      max: 500,
      color: '#667eea',
      icon: '🏬',
      description: '区域性连锁品牌'
    },
    {
      id: 'medium',
      label: '中规模',
      range: '501-2000店',
      min: 501,
      max: 2000,
      color: '#48bb78',
      icon: '🏢',
      description: '全国性连锁品牌'
    },
    {
      id: 'large',
      label: '大规模',
      range: '2001-5000店',
      min: 2001,
      max: 5000,
      color: '#ed8936',
      icon: '🏭',
      description: '行业龙头企业'
    },
    {
      id: 'mega',
      label: '超大规模',
      range: '>5000店',
      min: 5001,
      max: Infinity,
      color: '#f56565',
      icon: '🌟',
      description: '行业巨头垄断'
    }
  ];

  // 计算纯规模数据（不结合行业）
  $: pureScaleData = (() => {
    return scaleDefinitions.map(scale => {
      const industriesInScale = industryData.filter(item => 
        item.stores >= scale.min && item.stores <= scale.max
      );
      
      const totalStores = industriesInScale.reduce((sum, item) => sum + item.stores, 0);
      const totalCompanies = industriesInScale.reduce((sum, item) => sum + item.companies, 0);
      
      return {
        ...scale,
        industryCount: industriesInScale.length,
        totalStores,
        totalCompanies,
        avgStoresPerCompany: totalCompanies > 0 ? Math.round(totalStores / totalCompanies) : 0,
        storeShare: totalStores / industryData.reduce((sum, item) => sum + item.stores, 0) * 100
      };
    }).filter(scale => scale.industryCount > 0);
  })();

  // 计算结合行业的规模数据
  $: industryScaleData = (() => {
    return scaleDefinitions.map(scale => {
      const industriesInScale = industryData.filter(item => 
        item.stores >= scale.min && item.stores <= scale.max
      );
      
      const totalStores = industriesInScale.reduce((sum, item) => sum + item.stores, 0);
      const totalCompanies = industriesInScale.reduce((sum, item) => sum + item.companies, 0);
      const totalUsers = industriesInScale.reduce((sum, item) => sum + item.users, 0);
      const totalActiveUsers = industriesInScale.reduce((sum, item) => sum + item.activeUsers, 0);
      const avgActiveRate = industriesInScale.length > 0 ? 
        industriesInScale.reduce((sum, item) => sum + item.activeRate, 0) / industriesInScale.length : 0;
      const avgCompanyFlowRate = industriesInScale.length > 0 ?
        industriesInScale.reduce((sum, item) => sum + item.companyFlowRate, 0) / industriesInScale.length : 0;
      const avgStoreFlowRate = industriesInScale.length > 0 ?
        industriesInScale.reduce((sum, item) => sum + item.storeFlowRate, 0) / industriesInScale.length : 0;

      return {
        ...scale,
        industryCount: industriesInScale.length,
        industries: industriesInScale,
        totalStores,
        totalCompanies,
        totalUsers,
        totalActiveUsers,
        avgActiveRate: parseFloat(avgActiveRate.toFixed(1)),
        avgCompanyFlowRate: parseFloat(avgCompanyFlowRate.toFixed(1)),
        avgStoreFlowRate: parseFloat(avgStoreFlowRate.toFixed(1)),
        avgStoresPerCompany: totalCompanies > 0 ? Math.round(totalStores / totalCompanies) : 0,
        storeShare: totalStores / industryData.reduce((sum, item) => sum + item.stores, 0) * 100
      };
    }).filter(scale => scale.industryCount > 0);
  })();

  // 总体统计
  $: overallStats = {
    totalIndustries: industryData.length,
    totalStores: industryData.reduce((sum, item) => sum + item.stores, 0),
    totalCompanies: industryData.reduce((sum, item) => sum + item.companies, 0),
    avgStoresPerCompany: Math.round(industryData.reduce((sum, item) => sum + item.stores, 0) / industryData.reduce((sum, item) => sum + item.companies, 0))
  };

  // 视图模式配置
  const viewModes = {
    'pure-scale': {
      title: '门店规模分级',
      icon: '📊',
      description: '纯粹的门店规模分级统计'
    },
    'industry-scale': {
      title: '行业规模分布',
      icon: '🏭',
      description: '结合行业的规模分级分析'
    },
    'efficiency': {
      title: '规模效率对比',
      icon: '⚡',
      description: '不同规模的运营效率指标'
    }
  };

  onMount(() => {
    setTimeout(() => {
      createVisualization();
    }, 100);
  });

  $: if (svgContainer && viewMode) {
    createVisualization();
  }

  function createVisualization() {
    if (!svgContainer) return;
    
    d3.select(svgContainer).selectAll("*").remove();

    if (viewMode === 'pure-scale') {
      createPureScaleChart();
    } else if (viewMode === 'industry-scale') {
      createIndustryScaleChart();
    } else if (viewMode === 'efficiency') {
      createEfficiencyChart();
    }
  }

  function createPureScaleChart() {
    const width = 800;
    const height = 400;
    const margin = {top: 40, right: 40, bottom: 80, left: 80};

    const svg = d3.select(svgContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // 创建比例尺
    const xScale = d3.scaleBand()
      .domain(pureScaleData.map(d => d.label))
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(pureScaleData, d => d.totalStores)])
      .nice()
      .range([chartHeight, 0]);

    // 绘制坐标轴
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', '500');

    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickFormat(d => d >= 1000 ? (d/1000) + 'K' : d))
      .selectAll('text')
      .style('font-size', '12px');

    // 添加轴标签
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 50)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('门店规模级别');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('门店总数');

    // 绘制柱状图
    const bars = g.selectAll('.bar')
      .data(pureScaleData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.label))
      .attr('width', xScale.bandwidth())
      .attr('y', chartHeight)
      .attr('height', 0)
      .attr('fill', d => d.color)
      .attr('rx', 6)
      .style('cursor', 'pointer');

    // 动画
    bars.transition()
      .duration(800)
      .delay((d, i) => i * 150)
      .attr('y', d => yScale(d.totalStores))
      .attr('height', d => chartHeight - yScale(d.totalStores));

    // 添加数值标签
    g.selectAll('.bar-label')
      .data(pureScaleData)
      .enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.totalStores) - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#4a5568')
      .style('opacity', 0)
      .text(d => d.totalStores >= 1000 ? Math.round(d.totalStores/1000) + 'K' : d.totalStores)
      .transition()
      .duration(600)
      .delay((d, i) => i * 150 + 400)
      .style('opacity', 1);

    // 添加占比标签
    g.selectAll('.percentage-label')
      .data(pureScaleData)
      .enter().append('text')
      .attr('class', 'percentage-label')
      .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.totalStores) + 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', d => d.color)
      .style('opacity', 0)
      .text(d => d.storeShare.toFixed(1) + '%')
      .transition()
      .duration(600)
      .delay((d, i) => i * 150 + 600)
      .style('opacity', 1);
  }

  function createIndustryScaleChart() {
    const width = 900;
    const height = 500;
    const margin = {top: 40, right: 40, bottom: 80, left: 80};

    const svg = d3.select(svgContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // 为每个规模级别创建分组
    let yPosition = 0;
    const groupHeight = chartHeight / industryScaleData.length;

    industryScaleData.forEach((scale, scaleIndex) => {
      const scaleGroup = g.append('g')
        .attr('transform', `translate(0, ${yPosition})`);

      // 规模级别标题
      scaleGroup.append('text')
        .attr('x', 10)
        .attr('y', 20)
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', scale.color)
        .text(`${scale.icon} ${scale.label} (${scale.range})`);

      // 为该规模级别的行业创建柱状图
      if (scale.industries && scale.industries.length > 0) {
        const industryWidth = Math.min((chartWidth - 20) / scale.industries.length, 120);
        const xScale = d3.scaleBand()
          .domain(scale.industries.map(d => d.industry))
          .range([20, chartWidth - 20])
          .padding(0.1);

        const maxStores = d3.max(scale.industries, d => d.stores);
        const yScale = d3.scaleLinear()
          .domain([0, maxStores])
          .range([groupHeight - 60, 30]);

        // 绘制行业柱状图
        const industryBars = scaleGroup.selectAll('.industry-bar')
          .data(scale.industries)
          .enter().append('rect')
          .attr('class', 'industry-bar')
          .attr('x', d => xScale(d.industry))
          .attr('width', xScale.bandwidth())
          .attr('y', groupHeight - 30)
          .attr('height', 0)
          .attr('fill', scale.color)
          .attr('opacity', 0.8)
          .attr('rx', 3);

        // 动画
        industryBars.transition()
          .duration(800)
          .delay(scaleIndex * 200 + 300)
          .attr('y', d => yScale(d.stores))
          .attr('height', d => (groupHeight - 60) - yScale(d.stores));

        // 行业标签
        scaleGroup.selectAll('.industry-label')
          .data(scale.industries)
          .enter().append('text')
          .attr('class', 'industry-label')
          .attr('x', d => xScale(d.industry) + xScale.bandwidth() / 2)
          .attr('y', groupHeight - 10)
          .attr('text-anchor', 'middle')
          .style('font-size', '10px')
          .style('font-weight', '500')
          .style('fill', '#4a5568')
          .text(d => d.industry);

        // 门店数标签
        scaleGroup.selectAll('.store-label')
          .data(scale.industries)
          .enter().append('text')
          .attr('class', 'store-label')
          .attr('x', d => xScale(d.industry) + xScale.bandwidth() / 2)
          .attr('y', d => yScale(d.stores) - 5)
          .attr('text-anchor', 'middle')
          .style('font-size', '9px')
          .style('font-weight', 'bold')
          .style('fill', '#2d3748')
          .style('opacity', 0)
          .text(d => d.stores >= 1000 ? Math.round(d.stores/1000) + 'K' : d.stores)
          .transition()
          .duration(600)
          .delay(scaleIndex * 200 + 800)
          .style('opacity', 1);
      }

      yPosition += groupHeight;
    });
  }

  function createEfficiencyChart() {
    const width = 800;
    const height = 400;
    const margin = {top: 40, right: 140, bottom: 60, left: 60};

    const svg = d3.select(svgContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // 多指标对比
    const metrics = ['avgActiveRate', 'avgCompanyFlowRate', 'avgStoreFlowRate'];
    const metricLabels = ['用户活跃率', '企业客流率', '门店客流率'];
    
    // 创建比例尺
    const xScale = d3.scaleBand()
      .domain(industryScaleData.map(d => d.label))
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([chartHeight, 0]);

    // 绘制坐标轴
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px');

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => d + '%'))
      .selectAll('text')
      .style('font-size', '12px');

    // 绘制分组柱状图
    const barWidth = xScale.bandwidth() / metrics.length;
    const colors = ['#667eea', '#48bb78', '#ed8936'];

    metrics.forEach((metric, metricIndex) => {
      g.selectAll(`.bar-${metric}`)
        .data(industryScaleData)
        .enter().append('rect')
        .attr('class', `bar-${metric}`)
        .attr('x', d => xScale(d.label) + barWidth * metricIndex)
        .attr('width', barWidth)
        .attr('y', chartHeight)
        .attr('height', 0)
        .attr('fill', colors[metricIndex])
        .attr('rx', 2)
        .transition()
        .duration(800)
        .delay(metricIndex * 200)
        .attr('y', d => yScale(d[metric]))
        .attr('height', d => chartHeight - yScale(d[metric]));
    });

    // 添加图例
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 130}, 20)`);

    metricLabels.forEach((label, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);

      legendItem.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colors[i])
        .attr('rx', 2);

      legendItem.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .style('font-size', '12px')
        .style('font-weight', '500')
        .text(label);
    });
  }

  function changeViewMode(mode) {
    viewMode = mode;
  }

  function selectScale(scaleId) {
    selectedScale = selectedScale === scaleId ? null : scaleId;
  }
</script>

<div class="store-scale-analysis">
  <!-- 控制面板 -->
  <div class="controls-panel">
    <div class="panel-header">
      <h3 class="panel-title">🏪 门店规模分级分析</h3>
      <p class="panel-description">基于门店数量进行规模分级，分析不同规模级别的分布特征和运营效率</p>
    </div>
    
    <div class="view-controls">
      <span class="control-label">分析视图:</span>
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
  </div>

  <!-- 规模概览统计 -->
  <div class="scale-overview">
    <h4 class="overview-title">📊 总体概览</h4>
    <div class="overview-stats">
      <div class="overview-item">
        <span class="overview-value">{overallStats.totalIndustries}</span>
        <span class="overview-label">分析行业</span>
      </div>
      <div class="overview-item">
        <span class="overview-value">{formatNumber(overallStats.totalStores)}</span>
        <span class="overview-label">门店总数</span>
      </div>
      <div class="overview-item">
        <span class="overview-value">{formatNumber(overallStats.totalCompanies)}</span>
        <span class="overview-label">企业总数</span>
      </div>
      <div class="overview-item">
        <span class="overview-value">{overallStats.avgStoresPerCompany}</span>
        <span class="overview-label">平均店/企业</span>
      </div>
    </div>
  </div>

  <!-- 可视化图表区域 -->
  <div class="chart-container">
    <div class="chart-header">
      <h4>{viewModes[viewMode].title}</h4>
      <p>{viewModes[viewMode].description}</p>
    </div>
    <div bind:this={svgContainer} class="svg-container"></div>
  </div>

  <!-- 规模分级详情 - 仅在纯规模模式显示 -->
  {#if viewMode === 'pure-scale'}
    <div class="pure-scale-details">
      <h4 class="details-title">🎯 规模分级详情</h4>
      <div class="scale-cards-simple">
        {#each pureScaleData as scale}
          <div class="scale-card-simple" style="border-left-color: {scale.color}">
            <div class="card-header-simple">
              <span class="card-icon-simple">{scale.icon}</span>
              <div class="card-info">
                <h5>{scale.label}</h5>
                <span class="range-text">{scale.range}</span>
              </div>
              <div class="card-stats">
                <div class="stat-item">
                  <span class="stat-value">{formatNumber(scale.totalStores)}</span>
                  <span class="stat-label">门店</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{scale.industryCount}</span>
                  <span class="stat-label">行业</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{scale.storeShare.toFixed(1)}%</span>
                  <span class="stat-label">占比</span>
                </div>
              </div>
            </div>
            <div class="card-description-simple">{scale.description}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- 行业规模分级详情 - 仅在行业规模模式显示 -->
  {#if viewMode === 'industry-scale'}
    <div class="industry-scale-details">
      <h4 class="details-title">🏭 行业规模分级详情</h4>
      <div class="industry-cards">
        {#each industryScaleData as scale}
          <div 
            class="industry-card"
            class:selected={selectedScale === scale.id}
            style="border-left-color: {scale.color}"
            on:click={() => selectScale(scale.id)}
          >
            <div class="industry-card-header">
              <span class="card-icon">{scale.icon}</span>
              <div class="card-title-section">
                <h5 class="card-title">{scale.label}</h5>
                <span class="card-range">{scale.range}</span>
              </div>
              <div class="card-count">{scale.industryCount}个行业</div>
            </div>
            
            <div class="card-metrics">
              <div class="metric-row">
                <span class="metric-label">门店总数:</span>
                <span class="metric-value">{formatNumber(scale.totalStores)}店</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">企业总数:</span>
                <span class="metric-value">{formatNumber(scale.totalCompanies)}家</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">平均规模:</span>
                <span class="metric-value">{scale.avgStoresPerCompany}店/企业</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">活跃率:</span>
                <span class="metric-value">{scale.avgActiveRate}%</span>
              </div>
            </div>

            {#if selectedScale === scale.id}
              <div class="card-industries">
                <h6>包含行业:</h6>
                <div class="industries-list">
                  {#each scale.industries as industry}
                    <span class="industry-tag">
                      {industry.industry} ({formatNumber(industry.stores)}店)
                    </span>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

    
  
</div>

<style>
  .store-scale-analysis {
    width: 100%;
    padding: 20px;
    background: #fafbfc;
    border-radius: 15px;
  }

  /* 控制面板 */
  .controls-panel {
    background: white;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 30px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .panel-header {
    margin-bottom: 20px;
    text-align: center;
  }

  .panel-title {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    color: #2d3748;
  }

  .panel-description {
    margin: 0;
    color: #718096;
    font-size: 0.9rem;
  }

  .view-controls {
    display: flex;
    justify-content: center;
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

  /* 概览统计 */
  .scale-overview {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 30px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .overview-title {
    margin: 0 0 15px 0;
    font-size: 1.2rem;
    color: #4a5568;
    text-align: center;
  }

  .overview-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }

  .overview-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 15px;
    background: #f7fafc;
    border-radius: 10px;
  }

  .overview-value {
    font-size: 1.4rem;
    font-weight: bold;
    color: #667eea;
    line-height: 1;
  }

  .overview-label {
    font-size: 12px;
    color: #718096;
    margin-top: 4px;
    font-weight: 500;
  }

  /* 图表容器 */
  .chart-container {
    background: white;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 30px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .chart-header {
    text-align: center;
    margin-bottom: 20px;
  }

  .chart-header h4 {
    margin: 0 0 8px 0;
    color: #2d3748;
    font-size: 1.3rem;
  }

  .chart-header p {
    margin: 0;
    color: #718096;
    font-size: 0.9rem;
  }

  .svg-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }

  /* 纯规模详情 */
  .pure-scale-details {
    background: white;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 30px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .details-title {
    margin: 0 0 20px 0;
    font-size: 1.2rem;
    color: #4a5568;
    text-align: center;
  }

  .scale-cards-simple {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 15px;
  }

  .scale-card-simple {
    background: #f7fafc;
    border-radius: 10px;
    padding: 20px;
    border-left: 4px solid #667eea;
    transition: transform 0.3s ease;
  }

  .scale-card-simple:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .card-header-simple {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 12px;
  }

  .card-icon-simple {
    font-size: 1.5rem;
  }

  .card-info {
    flex: 1;
  }

  .card-info h5 {
    margin: 0;
    font-size: 1.1rem;
    color: #2d3748;
  }

  .range-text {
    font-size: 12px;
    color: #718096;
  }

  .card-stats {
    display: flex;
    gap: 15px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .stat-value {
    font-size: 1rem;
    font-weight: bold;
    color: #667eea;
    line-height: 1;
  }

  .stat-label {
    font-size: 10px;
    color: #718096;
    margin-top: 2px;
  }

  .card-description-simple {
    color: #718096;
    font-size: 13px;
    font-style: italic;
  }

  /* 行业规模详情 */
  .industry-scale-details {
    background: white;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 30px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .industry-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
  }

  .industry-card {
    background: #f7fafc;
    border-radius: 12px;
    padding: 20px;
    border-left: 4px solid #667eea;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .industry-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }

  .industry-card.selected {
    border-left-width: 6px;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
    background: white;
  }

  .industry-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 15px;
  }

  .card-icon {
    font-size: 1.5rem;
  }

  .card-title-section {
    flex: 1;
  }

  .card-title {
    margin: 0;
    font-size: 1.1rem;
    color: #2d3748;
  }

  .card-range {
    font-size: 12px;
    color: #718096;
  }

  .card-count {
    background: #e6fffa;
    color: #234e52;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
  }

  .card-metrics {
    margin-bottom: 15px;
  }

  .metric-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .metric-label {
    font-size: 12px;
    color: #718096;
  }

  .metric-value {
    font-size: 12px;
    font-weight: 600;
    color: #2d3748;
  }

  .card-industries {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #e2e8f0;
  }

  .card-industries h6 {
    margin: 0 0 10px 0;
    font-size: 12px;
    color: #4a5568;
  }

  .industries-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .industry-tag {
    background: #edf2f7;
    color: #4a5568;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 500;
  }

  /* 洞察分析 */
  .insights-section {
    background: white;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .insights-title {
    margin: 0 0 20px 0;
    font-size: 1.3rem;
    color: #4a5568;
    text-align: center;
    padding-bottom: 10px;
    border-bottom: 2px solid #e2e8f0;
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 15px;
  }

  .insight-card {
    padding: 15px;
    background: #f7fafc;
    border-radius: 10px;
    border-left: 4px solid #667eea;
    transition: transform 0.3s ease;
  }

  .insight-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .insight-card h5 {
    margin: 0 0 10px 0;
    color: #4a5568;
    font-size: 1rem;
  }

  .insight-card p {
    margin: 0;
    color: #718096;
    line-height: 1.5;
    font-size: 0.9rem;
  }

  /* 响应式设计 */
  @media (max-width: 1024px) {
    .view-controls {
      flex-direction: column;
      align-items: stretch;
    }

    .view-btn {
      justify-content: center;
    }

    .industry-cards {
      grid-template-columns: 1fr;
    }

    .scale-cards-simple {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .store-scale-analysis {
      padding: 15px;
    }

    .overview-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .insights-grid {
      grid-template-columns: 1fr;
    }

    .chart-container {
      padding: 15px;
    }

    .svg-container {
      min-height: 300px;
    }

    .card-stats {
      gap: 10px;
    }
  }

  @media (max-width: 480px) {
    .overview-stats {
      grid-template-columns: 1fr;
    }

    .card-header-simple {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .card-stats {
      align-self: stretch;
      justify-content: space-around;
    }

    .industry-card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
</style>