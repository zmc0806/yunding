<script>
  import Header from './lib/components/Header.svelte';
  import StatsOverview from './lib/components/StatsOverview.svelte';
  import DataTable from './lib/components/DataTable.svelte';
  import IndustryDonut from './lib/components/IndustryDonut.svelte';
  import YearlyGrowth from './lib/components/YearlyGrowth.svelte';
  import ActivityScatter from './lib/components/ActivityScatter.svelte';
  import DeviceBar from './lib/components/DeviceBar.svelte';
  import UserArea from './lib/components/UserArea.svelte';
</script>

<main class="dashboard">
  <Header />
  <StatsOverview />
  
  <!-- 完整数据表格 - 独立容器 -->
  <section class="table-section">
    <div class="chart-container table-container">
      <h3 class="chart-title">📊 完整行业数据对比表</h3>
      <DataTable />
    </div>
  </section>
  
  <!-- 可视化图表网格 - 改为单行布局 -->
  <section class="charts-section">
    <div class="visualization-grid">
      <!-- 行业企业分布 - 单独一行 -->
      <div class="chart-container chart-item full-width">
        <h3 class="chart-title">🏢 行业企业分布</h3>
        <IndustryDonut />
      </div>

      <!-- 年度企业增长趋势 - 单独一行 -->
      <div class="chart-container chart-item full-width">
        <h3 class="chart-title">📈 年度企业增长趋势</h3>
        <YearlyGrowth />
      </div>

      <!-- 各行业用户活跃度对比 - 单独一行 -->
      <div class="chart-container chart-item full-width">
        <h3 class="chart-title">👥 各行业用户活跃度对比</h3>
        <ActivityScatter />
      </div>

      <!-- 设备部署情况 - 单独一行 -->
      <div class="chart-container chart-item full-width">
        <h3 class="chart-title">📱 设备部署情况</h3>
        <DeviceBar />
      </div>


      <!-- 年度用户增长面积图 - 单独一行 -->
      <div class="chart-container chart-item full-width">
        <h3 class="chart-title">📊 年度用户增长面积图</h3>
        <UserArea />
      </div>
    </div>
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #acb5df 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .dashboard {
    max-width: 1600px;
    margin: 0 auto;
    padding: 20px;
    min-height: 100vh;
  }

  /* 表格区域样式 */
  .table-section {
    margin-bottom: 40px;
  }

  .table-container {
    width: 100%;
    max-width: none;
    padding: 25px;
  }

  /* 图表区域样式 */
  .charts-section {
    width: 100%;
  }

  /* 修改为单列布局 */
  .visualization-grid {
    display: grid;
    grid-template-columns: 1fr; /* 改为单列 */
    gap: 30px;
    width: 100%;
  }

  /* 基础图表容器样式 */
  .chart-container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid rgba(255,255,255,0.2);
  }

  .chart-container:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
  }

  .chart-title {
    font-size: 1.4rem;
    font-weight: bold;
    color: #4a5568;
    margin-bottom: 20px;
    text-align: center;
    padding-bottom: 10px;
    border-bottom: 2px solid #e2e8f0;
  }

  /* 全宽图表 - 现在所有图表都是全宽 */
  .full-width {
    grid-column: 1 / -1;
  }

  /* 图表项特定样式 */
  .chart-item {
    display: flex;
    flex-direction: column;
    height: fit-content;
    min-height: 400px; /* 增加最小高度以适应单行布局 */
  }

  /* 确保图表内容区域 */
  .chart-item > :global(*:not(.chart-title)) {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* 响应式设计 */
  @media (max-width: 1400px) {
    .visualization-grid {
      gap: 25px;
    }
  }

  @media (max-width: 1024px) {
    .dashboard {
      padding: 15px;
    }
    
    .visualization-grid {
      gap: 20px;
    }
    
    .chart-container {
      padding: 20px;
    }
    
    .chart-title {
      font-size: 1.2rem;
    }
    
    .chart-item {
      min-height: 350px; /* 移动端适当减小高度 */
    }
  }

  @media (max-width: 768px) {
    .dashboard {
      padding: 10px;
    }
    
    .visualization-grid {
      gap: 15px;
    }
    
    .chart-container {
      padding: 15px;
    }
    
    .chart-title {
      font-size: 1.1rem;
      margin-bottom: 15px;
    }
    
    .chart-item {
      min-height: 300px;
    }
  }

  @media (max-width: 480px) {
    .dashboard {
      padding: 8px;
    }
    
    .table-container {
      padding: 15px;
    }
    
    .chart-container {
      padding: 12px;
    }
    
    .visualization-grid {
      gap: 12px;
    }
    
    .chart-item {
      min-height: 280px; /* 小屏幕进一步减小 */
    }
  }

  /* 动画效果 */
  .chart-item {
    animation: fadeInUp 0.6s ease forwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 为不同的图表添加不同的动画延迟 */
  .chart-item:nth-child(1) { animation-delay: 0.1s; }
  .chart-item:nth-child(2) { animation-delay: 0.2s; }
  .chart-item:nth-child(3) { animation-delay: 0.3s; }
  .chart-item:nth-child(4) { animation-delay: 0.4s; }
  .chart-item:nth-child(5) { animation-delay: 0.5s; }
  .chart-item:nth-child(6) { animation-delay: 0.6s; }

  /* 打印样式 */
  @media print {
    .dashboard {
      background: white;
      color: black;
      padding: 0;
    }
    
    .chart-container {
      box-shadow: none;
      border: 1px solid #ccc;
      background: white;
      page-break-inside: avoid;
      margin-bottom: 20px;
    }
    
    .chart-title {
      color: black;
    }
    
    .visualization-grid {
      display: block;
    }
    
    .chart-item {
      margin-bottom: 30px;
    }
  }

  /* 高对比度模式支持 */
  @media (prefers-contrast: high) {
    .chart-container {
      border: 2px solid #000;
      background: #fff;
    }
    
    .chart-title {
      color: #000;
      border-bottom-color: #000;
    }
  }

  /* 减少动画模式支持 */
  @media (prefers-reduced-motion: reduce) {
    .chart-item {
      animation: none;
    }
    
    .chart-container:hover {
      transform: none;
    }
  }
</style>