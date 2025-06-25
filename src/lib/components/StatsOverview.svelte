<script>
  import { onMount } from 'svelte';
  import { summaryStats } from '../data/industryData.js';
  import { formatLargeNumber } from '../utils/formatters.js';

  let animatedStats = {
    totalCompanies: 0,
    totalUsers: 0,
    totalActiveUsers: 0,
    totalDevices: 0,
    totalStores: 0
  };

  onMount(() => {
    const animateValue = (key, target, suffix = '') => {
      let current = 0;
      const increment = target / 50;
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        animatedStats[key] = Math.floor(current);
      }, 30);
    };

    animateValue('totalCompanies', summaryStats.totalCompanies);
    animateValue('totalUsers', 75);
    animateValue('totalActiveUsers', 23);
    animateValue('totalDevices', 271);
    animateValue('totalStores', 58);
  });
</script>

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-number">{animatedStats.totalCompanies}</div>
    <div class="stat-label">总企业数</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">{animatedStats.totalUsers}K</div>
    <div class="stat-label">总用户数</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">{animatedStats.totalActiveUsers}K</div>
    <div class="stat-label">活跃用户数</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">{animatedStats.totalDevices}K</div>
    <div class="stat-label">设备总数</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">{animatedStats.totalStores}K</div>
    <div class="stat-label">门店总数</div>
  </div>
</div>

<!-- 新增：数据洞察分析 -->
<div class="insights-section">
  <h3 class="insights-title">数据洞察</h3>
  <div class="insights-content">
    <div class="insight-item">
      <span class="insight-icon">🏢</span>
      <p>平台已服务 <strong>658家</strong> 企业，覆盖多个重点行业领域。</p>
    </div>
    <div class="insight-item">
      <span class="insight-icon">👥</span>
      <p>累计用户规模达 <strong>7.5万</strong>，其中活跃用户 <strong>2.3万</strong>，整体活跃率约 <strong>30.8%</strong></p>
    </div>
    <div class="insight-item">
      <span class="insight-icon">📱</span>
      <p>设备部署总量超过 <strong>27万台</strong>，平均每家企业部署约 <strong>412台</strong> 设备。</p>
    </div>
  </div>
</div>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    padding: 25px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
    transition: transform 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-5px);
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: bold;
    color: #667eea;
    margin-bottom: 10px;
  }

  .stat-label {
    font-size: 1rem;
    color: #666;
    font-weight: 600;
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

