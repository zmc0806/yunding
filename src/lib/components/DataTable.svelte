<script>
  import { onMount } from 'svelte';

  const completeIndustryData = [
    {industry: '服装', companies: 133, users: 12136, activeUsers: 5523, devices: 52457, faceDevices: 8688, huinaDevices: 3033, stores: 9158, marketShare: 20.2, activeRate: 45.5},
    {industry: '鞋服', companies: 129, users: 13316, activeUsers: 6255, devices: 55539, faceDevices: 10409, huinaDevices: 5182, stores: 9946, marketShare: 19.6, activeRate: 47.0},
    {industry: '餐饮', companies: 117, users: 8376, activeUsers: 3834, devices: 31288, faceDevices: 88, huinaDevices: 52, stores: 8120, marketShare: 17.8, activeRate: 45.8},
    {industry: '家居', companies: 28, users: 4253, activeUsers: 663, devices: 38107, faceDevices: 157, huinaDevices: 621, stores: 9287, marketShare: 4.3, activeRate: 15.6},
    {industry: '商超', companies: 24, users: 2437, activeUsers: 1143, devices: 8590, faceDevices: 317, huinaDevices: 117, stores: 1956, marketShare: 3.6, activeRate: 46.9},
    {industry: '其他', companies: 23, users: 198, activeUsers: 26, devices: 352, faceDevices: 42, huinaDevices: 67, stores: 156, marketShare: 3.5, activeRate: 13.1},
    {industry: '3C', companies: 22, users: 1611, activeUsers: 491, devices: 3707, faceDevices: 0, huinaDevices: 1793, stores: 4166, marketShare: 3.3, activeRate: 30.5},
    {industry: '珠宝', companies: 21, users: 2726, activeUsers: 588, devices: 8922, faceDevices: 1272, huinaDevices: 563, stores: 3087, marketShare: 3.2, activeRate: 21.6},
    {industry: '百货店', companies: 21, users: 278, activeUsers: 68, devices: 787, faceDevices: 105, huinaDevices: 126, stores: 160, marketShare: 3.2, activeRate: 24.5},
    {industry: '汽车', companies: 17, users: 2681, activeUsers: 121, devices: 3189, faceDevices: 167, huinaDevices: 57, stores: 1171, marketShare: 2.6, activeRate: 4.5},
    {industry: '科技服务', companies: 14, users: 161, activeUsers: 22, devices: 464, faceDevices: 47, huinaDevices: 26, stores: 85, marketShare: 2.1, activeRate: 13.7},
    {industry: '便利店', companies: 10, users: 2319, activeUsers: 818, devices: 1209, faceDevices: 31, huinaDevices: 10, stores: 654, marketShare: 1.5, activeRate: 35.3},
    {industry: '建筑', companies: 9, users: 1700, activeUsers: 707, devices: 13410, faceDevices: 617, huinaDevices: 132, stores: 2528, marketShare: 1.4, activeRate: 41.6},
    {industry: '医药', companies: 9, users: 463, activeUsers: 307, devices: 1234, faceDevices: 0, huinaDevices: 369, stores: 441, marketShare: 1.4, activeRate: 66.3},
    {industry: '景点', companies: 8, users: 190, activeUsers: 65, devices: 1036, faceDevices: 74, huinaDevices: 109, stores: 242, marketShare: 1.2, activeRate: 34.2},
    {industry: '美妆', companies: 7, users: 62, activeUsers: 2, devices: 967, faceDevices: 19, huinaDevices: 165, stores: 117, marketShare: 1.1, activeRate: 3.2},
    {industry: '医美', companies: 6, users: 143, activeUsers: 95, devices: 3188, faceDevices: 0, huinaDevices: 18, stores: 428, marketShare: 0.9, activeRate: 66.4},
    {industry: '潮玩', companies: 6, users: 13929, activeUsers: 647, devices: 8583, faceDevices: 1044, huinaDevices: 46, stores: 699, marketShare: 0.9, activeRate: 4.6},
    {industry: '通信', companies: 5, users: 12, activeUsers: 0, devices: 19, faceDevices: 3, huinaDevices: 10, stores: 7, marketShare: 0.8, activeRate: 0.0},
    {industry: '家电', companies: 5, users: 912, activeUsers: 439, devices: 16911, faceDevices: 134, huinaDevices: 15671, stores: 794, marketShare: 0.8, activeRate: 48.1},
    {industry: '文化传媒', companies: 4, users: 7, activeUsers: 0, devices: 11, faceDevices: 4, huinaDevices: 0, stores: 5, marketShare: 0.6, activeRate: 0.0},
    {industry: '建材', companies: 4, users: 23, activeUsers: 10, devices: 68, faceDevices: 3, huinaDevices: 23, stores: 9, marketShare: 0.6, activeRate: 43.5},
    {industry: '眼镜', companies: 4, users: 80, activeUsers: 31, devices: 111, faceDevices: 100, huinaDevices: 4, stores: 77, marketShare: 0.6, activeRate: 38.8},
    {industry: '玩具', companies: 4, users: 25, activeUsers: 4, devices: 254, faceDevices: 7, huinaDevices: 15, stores: 16, marketShare: 0.6, activeRate: 16.0},
    {industry: '生鲜', companies: 3, users: 5851, activeUsers: 338, devices: 8809, faceDevices: 0, huinaDevices: 0, stores: 2847, marketShare: 0.5, activeRate: 5.8},
    {industry: '零食', companies: 3, users: 27, activeUsers: 3, devices: 100, faceDevices: 0, huinaDevices: 52, stores: 12, marketShare: 0.5, activeRate: 11.1},
    {industry: '商贸', companies: 3, users: 37, activeUsers: 18, devices: 94, faceDevices: 4, huinaDevices: 48, stores: 12, marketShare: 0.5, activeRate: 48.6},
    {industry: '地产', companies: 3, users: 5, activeUsers: 0, devices: 3, faceDevices: 1, huinaDevices: 0, stores: 3, marketShare: 0.5, activeRate: 0.0},
    {industry: '政务', companies: 3, users: 18, activeUsers: 5, devices: 1247, faceDevices: 2, huinaDevices: 0, stores: 875, marketShare: 0.5, activeRate: 27.8},
    {industry: '摩托', companies: 3, users: 1324, activeUsers: 961, devices: 10669, faceDevices: 4, huinaDevices: 1468, stores: 1187, marketShare: 0.5, activeRate: 72.6},
    {industry: '安保', companies: 3, users: 3, activeUsers: 0, devices: 4, faceDevices: 0, huinaDevices: 0, stores: 3, marketShare: 0.5, activeRate: 0.0},
    {industry: '洗衣', companies: 2, users: 10, activeUsers: 3, devices: 23, faceDevices: 0, huinaDevices: 0, stores: 6, marketShare: 0.3, activeRate: 30.0},
    {industry: '母婴', companies: 2, users: 5, activeUsers: 2, devices: 2, faceDevices: 1, huinaDevices: 0, stores: 2, marketShare: 0.3, activeRate: 40.0},
    {industry: '燃气', companies: 1, users: 3, activeUsers: 0, devices: 4, faceDevices: 4, huinaDevices: 0, stores: 4, marketShare: 0.2, activeRate: 0.0},
    {industry: '网吧', companies: 1, users: 4, activeUsers: 2, devices: 12, faceDevices: 0, huinaDevices: 0, stores: 5, marketShare: 0.2, activeRate: 50.0},
    {industry: '健身', companies: 1, users: 27, activeUsers: 0, devices: 91, faceDevices: 38, huinaDevices: 0, stores: 14, marketShare: 0.2, activeRate: 0.0}
  ];

  // 搜索和筛选状态
  let searchTerm = '';
  let sortColumn = 'companies';
  let sortDirection = 'desc';
  let currentPage = 1;
  let itemsPerPage = 15;

  // 响应式数据
  $: filteredData = completeIndustryData.filter(item => 
    item.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  $: sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    
    if (sortDirection === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  $: paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  $: totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // 排序处理
  function handleSort(column) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'desc';
    }
    currentPage = 1;
  }

  // 格式化数字
  function formatNumber(num) {
    return new Intl.NumberFormat('zh-CN').format(num);
  }

  // 获取行样式类
  function getRowClass(index, marketShare) {
    if (index < 3) return 'top-row';
    if (marketShare >= 5) return 'major-row';
    if (marketShare < 1) return 'minor-row';
    return '';
  }

  // 统计摘要
  $: summary = {
    totalIndustries: completeIndustryData.length,
    totalCompanies: completeIndustryData.reduce((sum, item) => sum + item.companies, 0),
    totalUsers: completeIndustryData.reduce((sum, item) => sum + item.users, 0),
    avgActiveRate: (completeIndustryData.reduce((sum, item) => sum + item.activeRate, 0) / completeIndustryData.length).toFixed(1)
  };
</script>

<!-- 完全移除包装器，直接输出内容 -->
<!-- 标题已经在App.svelte中处理，这里只输出表格功能 -->

<!-- 统计概览 -->
<div class="summary-stats">
  <div class="summary-item">
    <span class="summary-value">{summary.totalIndustries}</span>
    <span class="summary-label">行业数量</span>
  </div>
  <div class="summary-item">
    <span class="summary-value">{formatNumber(summary.totalCompanies)}</span>
    <span class="summary-label">企业总数</span>
  </div>
  <div class="summary-item">
    <span class="summary-value">{formatNumber(summary.totalUsers)}</span>
    <span class="summary-label">用户总数</span>
  </div>
  <div class="summary-item">
    <span class="summary-value">{summary.avgActiveRate}%</span>
    <span class="summary-label">平均活跃率</span>
  </div>
</div>

  <!-- 表格控制区域 -->
  <div class="table-controls">
    <div class="search-section">
      <input 
        type="text" 
        placeholder="🔍 搜索行业..." 
        bind:value={searchTerm}
        class="search-input"
      />
      <span class="result-count">
        显示 <span class="count-highlight">{sortedData.length}</span> / {completeIndustryData.length} 个行业
      </span>
    </div>

    <div class="control-group">
      <div class="pagination-info">
        <span>每页显示:</span>
        <select bind:value={itemsPerPage} on:change={() => currentPage = 1} class="page-select">
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={999}>全部</option>
        </select>
      </div>
    </div>
  </div>

  <!-- 数据表格 -->
  <div class="table-wrapper">
    <table class="data-table">
      <thead>
        <tr>
          <th class="rank-header">排名</th>
          <th 
            class="sortable {sortColumn === 'industry' ? 'sorted-' + sortDirection : ''}"
            on:click={() => handleSort('industry')}
          >
            行业
            <span class="sort-icon">
              {#if sortColumn === 'industry'}
                {sortDirection === 'asc' ? '↑' : '↓'}
              {:else}
                ↕
              {/if}
            </span>
          </th>
          <th 
            class="sortable {sortColumn === 'companies' ? 'sorted-' + sortDirection : ''}"
            on:click={() => handleSort('companies')}
          >
            企业数
            <span class="sort-icon">
              {#if sortColumn === 'companies'}
                {sortDirection === 'asc' ? '↑' : '↓'}
              {:else}
                ↕
              {/if}
            </span>
          </th>
          <th 
            class="sortable {sortColumn === 'users' ? 'sorted-' + sortDirection : ''}"
            on:click={() => handleSort('users')}
          >
            用户数
            <span class="sort-icon">
              {#if sortColumn === 'users'}
                {sortDirection === 'asc' ? '↑' : '↓'}
              {:else}
                ↕
              {/if}
            </span>
          </th>
          <th 
            class="sortable {sortColumn === 'activeUsers' ? 'sorted-' + sortDirection : ''}"
            on:click={() => handleSort('activeUsers')}
          >
            活跃用户数
            <span class="sort-icon">
              {#if sortColumn === 'activeUsers'}
                {sortDirection === 'asc' ? '↑' : '↓'}
              {:else}
                ↕
              {/if}
            </span>
          </th>
          <th 
            class="sortable {sortColumn === 'devices' ? 'sorted-' + sortDirection : ''}"
            on:click={() => handleSort('devices')}
          >
            设备数
            <span class="sort-icon">
              {#if sortColumn === 'devices'}
                {sortDirection === 'asc' ? '↑' : '↓'}
              {:else}
                ↕
              {/if}
            </span>
          </th>
          <th 
            class="sortable {sortColumn === 'faceDevices' ? 'sorted-' + sortDirection : ''}"
            on:click={() => handleSort('faceDevices')}
          >
            人脸设备
            <span class="sort-icon">
              {#if sortColumn === 'faceDevices'}
                {sortDirection === 'asc' ? '↑' : '↓'}
              {:else}
                ↕
              {/if}
            </span>
          </th>
          <th 
            class="sortable {sortColumn === 'huinaDevices' ? 'sorted-' + sortDirection : ''}"
            on:click={() => handleSort('huinaDevices')}
          >
            汇纳设备
            <span class="sort-icon">
              {#if sortColumn === 'huinaDevices'}
                {sortDirection === 'asc' ? '↑' : '↓'}
              {:else}
                ↕
              {/if}
            </span>
          </th>
          <th 
            class="sortable {sortColumn === 'stores' ? 'sorted-' + sortDirection : ''}"
            on:click={() => handleSort('stores')}
          >
            门店总量
            <span class="sort-icon">
              {#if sortColumn === 'stores'}
                {sortDirection === 'asc' ? '↑' : '↓'}
              {:else}
                ↕
              {/if}
            </span>
          </th>
          <th 
            class="sortable {sortColumn === 'marketShare' ? 'sorted-' + sortDirection : ''}"
            on:click={() => handleSort('marketShare')}
          >
            企业占比(%)
            <span class="sort-icon">
              {#if sortColumn === 'marketShare'}
                {sortDirection === 'asc' ? '↑' : '↓'}
              {:else}
                ↕
              {/if}
            </span>
          </th>
          <th 
            class="sortable {sortColumn === 'activeRate' ? 'sorted-' + sortDirection : ''}"
            on:click={() => handleSort('activeRate')}
          >
            用户活跃率(%)
            <span class="sort-icon">
              {#if sortColumn === 'activeRate'}
                {sortDirection === 'asc' ? '↑' : '↓'}
              {:else}
                ↕
              {/if}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each paginatedData as item, index}
          <tr class="data-row {getRowClass((currentPage-1)*itemsPerPage + index, item.marketShare)}">
            <td class="rank-cell">
              {(currentPage-1)*itemsPerPage + index + 1}
              {#if (currentPage-1)*itemsPerPage + index < 3}
                <span class="medal">🏆</span>
              {/if}
            </td>
            <td class="industry-cell">
              <span class="industry-name">{item.industry}</span>
            </td>
            <td class="number-cell">{formatNumber(item.companies)}</td>
            <td class="number-cell">{formatNumber(item.users)}</td>
            <td class="number-cell">{formatNumber(item.activeUsers)}</td>
            <td class="number-cell">{formatNumber(item.devices)}</td>
            <td class="number-cell">{formatNumber(item.faceDevices)}</td>
            <td class="number-cell">{formatNumber(item.huinaDevices)}</td>
            <td class="number-cell">{formatNumber(item.stores)}</td>
            <td class="percent-cell">
              <span class="percent-value">{item.marketShare}%</span>
              <div class="percent-bar">
                <div class="percent-fill" style="width: {Math.min(item.marketShare * 2, 100)}%"></div>
              </div>
            </td>
            <td class="percent-cell">
              <span class="percent-value">{item.activeRate}%</span>
              <div class="percent-bar">
                <div class="percent-fill active-fill" style="width: {item.activeRate}%"></div>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- 分页控制 -->
  {#if totalPages > 1}
    <div class="pagination">
      <button 
        class="page-btn" 
        disabled={currentPage === 1}
        on:click={() => currentPage = 1}
      >
        首页
      </button>
      <button 
        class="page-btn" 
        disabled={currentPage === 1}
        on:click={() => currentPage--}
      >
        上一页
      </button>
      
      <span class="page-info">
        第 <span class="current-page">{currentPage}</span> / {totalPages} 页
      </span>
      
      <button 
        class="page-btn" 
        disabled={currentPage === totalPages}
        on:click={() => currentPage++}
      >
        下一页
      </button>
      <button 
        class="page-btn" 
        disabled={currentPage === totalPages}
        on:click={() => currentPage = totalPages}
      >
        末页
      </button>
    </div>
  {/if}

<style>
  /* 移除包装器样式，直接使用内容样式 */

  .summary-stats {
    display: flex;
    justify-content: space-around;
    background: #f8fafc;
    border-radius: 10px;
    padding: 15px;
    border: 1px solid #e2e8f0;
    margin-bottom: 20px;
    width: 100%;
    box-sizing: border-box;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .summary-value {
    font-size: 1.3rem;
    font-weight: bold;
    color: #667eea;
    line-height: 1;
  }

  .summary-label {
    font-size: 12px;
    color: #718096;
    margin-top: 4px;
    font-weight: 500;
  }

  /* 控制区域 */
  .table-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 20px;
    flex-wrap: wrap;
    width: 100%;
    box-sizing: border-box;
  }

  .search-section {
    display: flex;
    align-items: center;
    gap: 15px;
    flex: 1;
  }

  .search-input {
    padding: 12px 18px;
    border: 2px solid #e2e8f0;
    border-radius: 25px;
    font-size: 14px;
    outline: none;
    transition: all 0.3s ease;
    min-width: 250px;
    max-width: 100%;
    background: white;
    box-sizing: border-box;
  }

  .search-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .result-count {
    color: #718096;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  }

  .count-highlight {
    color: #667eea;
    font-weight: bold;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .pagination-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #718096;
    white-space: nowrap;
  }

  .page-select {
    padding: 8px 12px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    cursor: pointer;
    transition: border-color 0.3s ease;
  }

  .page-select:focus {
    border-color: #667eea;
    outline: none;
  }

  /* 表格样式 */
  .table-wrapper {
    flex: 1;
    max-height: 600px;
    overflow-x: auto; /* 水平滚动 */
    overflow-y: auto; /* 垂直滚动 */
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    margin-bottom: 20px;
    width: 100%; /* 确保表格宽度100% */
    box-sizing: border-box;
  }

  .data-table {
    width: 100%;
    min-width: 1200px; /* 设置最小宽度，确保表格足够宽 */
    border-collapse: collapse;
    font-size: 14px;
    background: white;
    table-layout: auto; /* 改回自动布局，让表格自然撑开 */
  }

  .data-table thead th {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 16px 8px; /* 减少水平padding让表格更宽 */
    text-align: center;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 10;
    white-space: nowrap;
    border-right: 1px solid rgba(255,255,255,0.2);
    font-size: 12px; /* 稍微减小字体让内容更紧凑 */
    min-width: 80px; /* 设置最小列宽 */
  }

  .data-table thead th:last-child {
    border-right: none;
  }

  .sortable {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s ease;
    position: relative;
  }

  .sortable:hover {
    background: rgba(255,255,255,0.15);
  }

  .sort-icon {
    margin-left: 5px;
    font-size: 12px;
    opacity: 0.7;
    display: inline-block;
  }

  .sorted-asc .sort-icon,
  .sorted-desc .sort-icon {
    opacity: 1;
    color: #ffd700;
  }

  .data-row {
    transition: all 0.3s ease;
  }

  .data-row:hover {
    background-color: #f8f9ff;
    transform: scale(1.005);
  }

  .top-row {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.1));
    font-weight: 600;
  }

  .major-row {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.05));
  }

  .minor-row {
    background: rgba(0, 0, 0, 0.02);
  }

  .data-table td {
    padding: 14px 8px; /* 减少水平padding */
    text-align: center;
    border-bottom: 1px solid #f1f5f9;
    border-right: 1px solid #f1f5f9;
    font-size: 12px; /* 稍微减小字体 */
    min-width: 80px; /* 设置最小列宽 */
  }

  .data-table td:last-child {
    border-right: none;
  }

  .rank-cell {
    font-weight: bold;
    color: #667eea;
    position: relative;
    min-width: 60px;
  }

  .medal {
    margin-left: 5px;
    font-size: 16px;
  }

  .industry-cell {
    text-align: left !important;
    font-weight: 600;
    color: #333;
    min-width: 80px;
  }

  .industry-name {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 15px;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    font-size: 12px;
    font-weight: 600;
  }

  .number-cell {
    font-family: 'Monaco', 'Consolas', monospace;
    font-weight: 500;
    color: #555;
    white-space: nowrap;
  }

  .percent-cell {
    position: relative;
    min-width: 120px;
  }

  .percent-value {
    display: block;
    font-weight: bold;
    margin-bottom: 6px;
    color: #333;
    font-size: 13px;
  }

  .percent-bar {
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
    margin: 0 auto;
    width: 85%;
  }

  .percent-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 4px;
    transition: width 0.8s ease;
  }

  .active-fill {
    background: linear-gradient(90deg, #f5576c, #ff6b6b);
  }

  /* 分页样式 */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 20px 0;
    border-top: 1px solid #e2e8f0;
    margin-top: auto;
  }

  .page-btn {
    padding: 10px 18px;
    border: 2px solid #e2e8f0;
    background: white;
    color: #667eea;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 500;
  }

  .page-btn:hover:not(:disabled) {
    background: #667eea;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  }

  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .page-info {
    margin: 0 20px;
    font-weight: 600;
    color: #4a5568;
    font-size: 14px;
  }

  .current-page {
    color: #667eea;
    font-weight: bold;
  }

  /* 响应式设计 */
  @media (max-width: 1400px) {
    .summary-stats {
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .summary-item {
      min-width: 100px;
    }
  }

  @media (max-width: 1200px) {
    .chart-container {
      padding: 25px;
    }
    
    .data-table {
      font-size: 12px;
    }
    
    .data-table th,
    .data-table td {
      padding: 10px 8px;
    }
    
    .chart-title {
      font-size: 1.2rem;
    }
  }

  @media (max-width: 1024px) {
    .table-controls {
      flex-direction: column;
      align-items: stretch;
      gap: 15px;
    }
    
    .search-section {
      justify-content: space-between;
    }
    
    .search-input {
      min-width: 200px;
      flex: 1;
    }
    
    .control-group {
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    .chart-container {
      padding: 20px;
    }
    
    .summary-stats {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    
    .search-section {
      flex-direction: column;
      gap: 10px;
    }
    
    .search-input {
      min-width: auto;
      width: 100%;
    }
    
    .table-wrapper {
      max-height: 500px;
    }
    
    .data-table {
      font-size: 11px;
    }
    
    .data-table th,
    .data-table td {
      padding: 8px 6px;
    }
    
    .pagination {
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .page-btn {
      padding: 8px 14px;
      font-size: 13px;
    }
  }

  @media (max-width: 480px) {
    .chart-container {
      padding: 15px;
    }
    
    .summary-stats {
      grid-template-columns: 1fr;
    }
    
    .chart-title {
      font-size: 1.1rem;
    }
    
    .table-wrapper {
      max-height: 400px;
    }
    
    .data-table {
      font-size: 10px;
    }
    
    .pagination {
      flex-direction: column;
      gap: 10px;
    }
    
    .page-info {
      order: -1;
    }
  }

  /* 滚动条样式 */
  .table-wrapper::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .table-wrapper::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  .table-wrapper::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 4px;
    transition: background 0.3s ease;
  }

  .table-wrapper::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }

  /* 加载动画 - 移除，由父容器处理 */
  /* .data-table-wrapper {
    animation: fadeInUp 0.6s ease forwards;
  } */

  /* 高对比度模式支持 */
  @media (prefers-contrast: high) {
    .search-input {
      border-color: #000;
    }
    
    .page-btn {
      border-color: #000;
      color: #000;
    }
  }

  /* 减少动画模式支持 */
  @media (prefers-reduced-motion: reduce) {
    .data-row {
      transition: none;
    }
    
    .percent-fill {
      transition: none;
    }
  }

  /* 打印样式 */
  @media print {
    .table-controls {
      display: none;
    }
    
    .pagination {
      display: none;
    }
    
    .table-wrapper {
      max-height: none;
      overflow: visible;
    }
    
    .data-table th {
      background: #f0f0f0 !important;
      color: #000 !important;
    }
  }
</style>