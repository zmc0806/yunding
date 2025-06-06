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
</style>