<script>
  import { onMount } from 'svelte';

  // 基于实际CSV数据计算的完整行业数据（包含新的客流指标）
  const completeIndustryData = [
    {industry: '鞋服', companies: 262, users: 25452, activeUsers: 11778, devices: 107996, faceDevices: 19097, huinaDevices: 8215, stores: 19104, marketShare: 39.8, activeRate: 46.3, companyFlowRate: 51.5, storeFlowRate: 49.5},
    {industry: '餐饮', companies: 117, users: 8376, activeUsers: 3834, devices: 31288, faceDevices: 88, huinaDevices: 52, stores: 8120, marketShare: 17.8, activeRate: 45.8, companyFlowRate: 8.5, storeFlowRate: 0.3},
    {industry: '家居', companies: 28, users: 4253, activeUsers: 663, devices: 38107, faceDevices: 157, huinaDevices: 621, stores: 9287, marketShare: 4.3, activeRate: 15.6, companyFlowRate: 39.3, storeFlowRate: 2.3},
    {industry: '商超', companies: 24, users: 2437, activeUsers: 1143, devices: 8590, faceDevices: 317, huinaDevices: 117, stores: 1956, marketShare: 3.6, activeRate: 46.9, companyFlowRate: 33.3, storeFlowRate: 2.4},
    {industry: '其他', companies: 23, users: 198, activeUsers: 26, devices: 352, faceDevices: 42, huinaDevices: 67, stores: 156, marketShare: 3.5, activeRate: 13.1, companyFlowRate: 34.8, storeFlowRate: 17.3},
    {industry: '3C', companies: 22, users: 1611, activeUsers: 491, devices: 3707, faceDevices: 0, huinaDevices: 1793, stores: 4166, marketShare: 3.3, activeRate: 30.5, companyFlowRate: 40.9, storeFlowRate: 6.4},
    {industry: '珠宝', companies: 21, users: 2726, activeUsers: 588, devices: 8922, faceDevices: 1272, huinaDevices: 563, stores: 3087, marketShare: 3.2, activeRate: 21.6, companyFlowRate: 33.3, storeFlowRate: 12.6},
    {industry: '百货店', companies: 21, users: 278, activeUsers: 68, devices: 787, faceDevices: 105, huinaDevices: 126, stores: 160, marketShare: 3.2, activeRate: 24.5, companyFlowRate: 52.4, storeFlowRate: 16.9},
    {industry: '汽车', companies: 17, users: 2681, activeUsers: 121, devices: 3189, faceDevices: 167, huinaDevices: 57, stores: 1171, marketShare: 2.6, activeRate: 4.5, companyFlowRate: 23.5, storeFlowRate: 1.4},
    {industry: '科技服务', companies: 14, users: 161, activeUsers: 22, devices: 464, faceDevices: 47, huinaDevices: 26, stores: 85, marketShare: 2.1, activeRate: 13.7, companyFlowRate: 14.3, storeFlowRate: 8.2},
    {industry: '便利店', companies: 10, users: 2319, activeUsers: 818, devices: 1209, faceDevices: 31, huinaDevices: 10, stores: 654, marketShare: 1.5, activeRate: 35.3, companyFlowRate: 30.0, storeFlowRate: 3.8},
    {industry: '建筑', companies: 9, users: 1700, activeUsers: 707, devices: 13410, faceDevices: 617, huinaDevices: 132, stores: 2528, marketShare: 1.4, activeRate: 41.6, companyFlowRate: 22.2, storeFlowRate: 1.2},
    {industry: '医药', companies: 9, users: 463, activeUsers: 307, devices: 1234, faceDevices: 0, huinaDevices: 369, stores: 441, marketShare: 1.4, activeRate: 66.3, companyFlowRate: 55.6, storeFlowRate: 18.4},
    {industry: '景点', companies: 8, users: 190, activeUsers: 65, devices: 1036, faceDevices: 74, huinaDevices: 109, stores: 242, marketShare: 1.2, activeRate: 34.2, companyFlowRate: 25.0, storeFlowRate: 8.7},
    {industry: '美妆', companies: 7, users: 62, activeUsers: 2, devices: 967, faceDevices: 19, huinaDevices: 165, stores: 117, marketShare: 1.1, activeRate: 3.2, companyFlowRate: 14.3, storeFlowRate: 2.6},
    {industry: '医美', companies: 6, users: 143, activeUsers: 95, devices: 3188, faceDevices: 0, huinaDevices: 18, stores: 428, marketShare: 0.9, activeRate: 66.4, companyFlowRate: 16.7, storeFlowRate: 0.9},
    {industry: '潮玩', companies: 6, users: 13929, activeUsers: 647, devices: 8583, faceDevices: 1044, huinaDevices: 46, stores: 699, marketShare: 0.9, activeRate: 4.6, companyFlowRate: 33.3, storeFlowRate: 14.7},
    {industry: '通信', companies: 5, users: 12, activeUsers: 0, devices: 19, faceDevices: 3, huinaDevices: 10, stores: 7, marketShare: 0.8, activeRate: 0.0, companyFlowRate: 0.0, storeFlowRate: 0.0},
    {industry: '家电', companies: 5, users: 912, activeUsers: 439, devices: 16911, faceDevices: 134, huinaDevices: 15671, stores: 794, marketShare: 0.8, activeRate: 48.1, companyFlowRate: 40.0, storeFlowRate: 6.8},
    {industry: '文化传媒', companies: 4, users: 7, activeUsers: 0, devices: 11, faceDevices: 4, huinaDevices: 0, stores: 5, marketShare: 0.6, activeRate: 0.0, companyFlowRate: 0.0, storeFlowRate: 0.0},
    {industry: '建材', companies: 4, users: 23, activeUsers: 10, devices: 68, faceDevices: 3, huinaDevices: 23, stores: 9, marketShare: 0.6, activeRate: 43.5, companyFlowRate: 25.0, storeFlowRate: 11.1},
    {industry: '眼镜', companies: 4, users: 80, activeUsers: 31, devices: 111, faceDevices: 100, huinaDevices: 4, stores: 77, marketShare: 0.6, activeRate: 38.8, companyFlowRate: 75.0, storeFlowRate: 32.5},
    {industry: '玩具', companies: 4, users: 25, activeUsers: 4, devices: 254, faceDevices: 7, huinaDevices: 15, stores: 16, marketShare: 0.6, activeRate: 16.0, companyFlowRate: 25.0, storeFlowRate: 6.3},
    {industry: '生鲜', companies: 3, users: 5851, activeUsers: 338, devices: 8809, faceDevices: 0, huinaDevices: 0, stores: 2847, marketShare: 0.5, activeRate: 5.8, companyFlowRate: 33.3, storeFlowRate: 3.2},
    {industry: '零食', companies: 3, users: 27, activeUsers: 3, devices: 100, faceDevices: 0, huinaDevices: 52, stores: 12, marketShare: 0.5, activeRate: 11.1, companyFlowRate: 0.0, storeFlowRate: 0.0},
    {industry: '商贸', companies: 3, users: 37, activeUsers: 18, devices: 94, faceDevices: 4, huinaDevices: 48, stores: 12, marketShare: 0.5, activeRate: 48.6, companyFlowRate: 33.3, storeFlowRate: 8.3},
    {industry: '地产', companies: 3, users: 5, activeUsers: 0, devices: 3, faceDevices: 1, huinaDevices: 0, stores: 3, marketShare: 0.5, activeRate: 0.0, companyFlowRate: 0.0, storeFlowRate: 0.0},
    {industry: '政务', companies: 3, users: 18, activeUsers: 5, devices: 1247, faceDevices: 2, huinaDevices: 0, stores: 875, marketShare: 0.5, activeRate: 27.8, companyFlowRate: 0.0, storeFlowRate: 0.1},
    {industry: '摩托', companies: 3, users: 1324, activeUsers: 961, devices: 10669, faceDevices: 4, huinaDevices: 1468, stores: 1187, marketShare: 0.5, activeRate: 72.6, companyFlowRate: 33.3, storeFlowRate: 5.6},
    {industry: '安保', companies: 3, users: 3, activeUsers: 0, devices: 4, faceDevices: 0, huinaDevices: 0, stores: 3, marketShare: 0.5, activeRate: 0.0, companyFlowRate: 0.0, storeFlowRate: 0.0},
    {industry: '洗衣', companies: 2, users: 10, activeUsers: 3, devices: 23, faceDevices: 0, huinaDevices: 0, stores: 6, marketShare: 0.3, activeRate: 30.0, companyFlowRate: 0.0, storeFlowRate: 0.0},
    {industry: '母婴', companies: 2, users: 5, activeUsers: 2, devices: 2, faceDevices: 1, huinaDevices: 0, stores: 2, marketShare: 0.3, activeRate: 40.0, companyFlowRate: 50.0, storeFlowRate: 50.0},
    {industry: '燃气', companies: 1, users: 3, activeUsers: 0, devices: 4, faceDevices: 4, huinaDevices: 0, stores: 4, marketShare: 0.2, activeRate: 0.0, companyFlowRate: 0.0, storeFlowRate: 0.0},
    {industry: '网吧', companies: 1, users: 4, activeUsers: 2, devices: 12, faceDevices: 0, huinaDevices: 0, stores: 5, marketShare: 0.2, activeRate: 50.0, companyFlowRate: 0.0, storeFlowRate: 0.0},
    {industry: '健身', companies: 1, users: 27, activeUsers: 0, devices: 91, faceDevices: 38, huinaDevices: 0, stores: 14, marketShare: 0.2, activeRate: 0.0, companyFlowRate: 0.0, storeFlowRate: 0.0}
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
    avgActiveRate: (completeIndustryData.reduce((sum, item) => sum + item.activeRate, 0) / completeIndustryData.length).toFixed(1),
    avgCompanyFlowRate: (completeIndustryData.reduce((sum, item) => sum + item.companyFlowRate, 0) / completeIndustryData.length).toFixed(1),
    avgStoreFlowRate: (completeIndustryData.reduce((sum, item) => sum + item.storeFlowRate, 0) / completeIndustryData.length).toFixed(1)
  };
</script>

<!-- 确保这个div占满整个父容器 -->
<div class="table-content-wrapper">
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
    <div class="summary-item">
      <span class="summary-value">{summary.avgCompanyFlowRate}%</span>
      <span class="summary-label">平均企业客流率</span>
    </div>
    <div class="summary-item">
      <span class="summary-value">{summary.avgStoreFlowRate}%</span>
      <span class="summary-label">平均门店客流率</span>
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
          <!-- 新增列：有客流企业比例 -->
          <th 
            class="sortable {sortColumn === 'companyFlowRate' ? 'sorted-' + sortDirection : ''}"
            on:click={() => handleSort('companyFlowRate')}
          >
            有客流企业比例(%)
            <span class="sort-icon">
              {#if sortColumn === 'companyFlowRate'}
                {sortDirection === 'asc' ? '↑' : '↓'}
              {:else}
                ↕
              {/if}
            </span>
          </th>
          <!-- 新增列：有客流门店比例 -->
          <th 
            class="sortable {sortColumn === 'storeFlowRate' ? 'sorted-' + sortDirection : ''}"
            on:click={() => handleSort('storeFlowRate')}
          >
            有客流门店比例(%)
            <span class="sort-icon">
              {#if sortColumn === 'storeFlowRate'}
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
            <!-- 新增列数据：有客流企业比例 -->
            <td class="percent-cell">
              <span class="percent-value">{item.companyFlowRate}%</span>
              <div class="percent-bar">
                <div class="percent-fill company-flow-fill" style="width: {item.companyFlowRate}%"></div>
              </div>
            </td>
            <!-- 新增列数据：有客流门店比例 -->
            <td class="percent-cell">
              <span class="percent-value">{item.storeFlowRate}%</span>
              <div class="percent-bar">
                <div class="percent-fill store-flow-fill" style="width: {item.storeFlowRate}%"></div>
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
</div>

<!-- 新增：行业分析结论 -->
<div class="analysis-conclusion">
  <h4 class="conclusion-title">🔍 行业分析结论</h4>
  <div class="conclusion-grid">
    <div class="conclusion-card">
      <h5>🥇 头部行业特征</h5>
      <p><strong>鞋服、餐饮、家居</strong> 三大行业占据主导地位，企业数量占比超过60%，用户规模优势明显，是平台的核心支柱行业。</p>
    </div>
    <div class="conclusion-card">
      <h5>⚡ 活跃度表现</h5>
      <p><strong>摩托、医美、医药</strong> 行业虽然企业数量较少，但用户活跃率超过65%，显示出较强的用户粘性和业务价值。</p>
    </div>
    <div class="conclusion-card">
      <h5>🏪 客流覆盖分析</h5>
      <p><strong>鞋服、百货店、医药</strong> 行业客流覆盖率领先，企业客流覆盖率超过50%，体现了良好的数字化运营水平和客流数据采集能力。</p>
    </div>
    <div class="conclusion-card">
      <h5>📊 运营效率差异</h5>
      <p>不同行业间客流数据采集能力差异明显，<strong>眼镜、母婴</strong> 等精品行业门店客流覆盖率相对较高，而 <strong>餐饮、汽车</strong> 等行业还有较大提升空间。</p>
    </div>
    <div class="conclusion-card">
      <h5>🎯 发展建议</h5>
      <p>重点扶持 <strong>3C、珠宝、百货</strong> 等中等规模行业的客流数据采集，同时挖掘新兴细分领域的增长潜力，提升整体平台的数据价值密度。</p>
    </div>
    <div class="conclusion-card">
      <h5>📈 数据质量洞察</h5>
      <p>平台整体客流数据覆盖有待提升，<strong>企业客流率31.8%</strong>，<strong>门店客流率11.7%</strong>，存在较大的数据采集优化空间。</p>
    </div>
  </div>
</div>

<style>
  /* 最外层包装器 - 强制占满父容器 */
  .table-content-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0; /* 允许收缩 */
  }

  .summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 15px;
    background: #f8fafc;
    border-radius: 10px;
    padding: 15px;
    border: 1px solid #e2e8f0;
    width: 100%;
    box-sizing: border-box;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 10px;
  }

  .summary-value {
    font-size: 1.2rem;
    font-weight: bold;
    color: #667eea;
    line-height: 1;
  }

  .summary-label {
    font-size: 11px;
    color: #718096;
    margin-top: 4px;
    font-weight: 500;
  }

  /* 控制区域 */
  .table-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    width: 100%;
  }

  .search-section {
    display: flex;
    align-items: center;
    gap: 15px;
    flex: 1;
    min-width: 300px;
  }

  .search-input {
    padding: 12px 18px;
    border: 2px solid #e2e8f0;
    border-radius: 25px;
    font-size: 14px;
    outline: none;
    transition: all 0.3s ease;
    flex: 1;
    max-width: 400px;
    background: white;
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

  /* 表格样式 - 关键：确保表格填满整个宽度 */
  .table-wrapper {
    flex: 1;
    width: 100%;
    max-height: 600px;
    overflow: auto;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: white;
  }

  .data-table {
    width: 100%;
    min-width: 1400px; /* 增加最小宽度以适应新列 */
    border-collapse: collapse;
    font-size: 12px;
    background: white;
  }

  .data-table thead th {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 12px 8px;
    text-align: center;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 10;
    white-space: nowrap;
    border-right: 1px solid rgba(255,255,255,0.2);
    font-size: 11px;
  }

  .data-table thead th:last-child {
    border-right: none;
  }

  .sortable {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s ease;
  }

  .sortable:hover {
    background: rgba(255,255,255,0.15);
  }

  .sort-icon {
    margin-left: 5px;
    font-size: 10px;
    opacity: 0.7;
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
    padding: 10px 8px;
    text-align: center;
    border-bottom: 1px solid #f1f5f9;
    border-right: 1px solid #f1f5f9;
    font-size: 11px;
  }

  .data-table td:last-child {
    border-right: none;
  }

  .rank-cell {
    font-weight: bold;
    color: #667eea;
    width: 50px;
  }

  .medal {
    margin-left: 5px;
    font-size: 12px;
  }

  .industry-cell {
    text-align: left !important;
    font-weight: 600;
    color: #333;
    width: 70px;
  }

  .industry-name {
    display: inline-block;
    padding: 3px 6px;
    border-radius: 10px;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    font-size: 10px;
    font-weight: 600;
  }

  .number-cell {
    font-family: 'Monaco', 'Consolas', monospace;
    font-weight: 500;
    color: #555;
    white-space: nowrap;
    width: 80px;
  }

  .percent-cell {
    width: 100px;
  }

  .percent-value {
    display: block;
    font-weight: bold;
    margin-bottom: 4px;
    color: #333;
    font-size: 11px;
  }

  .percent-bar {
    height: 5px;
    background: #e2e8f0;
    border-radius: 3px;
    overflow: hidden;
    margin: 0 auto;
    width: 80%;
  }

  .percent-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 3px;
    transition: width 0.8s ease;
  }

  .active-fill {
    background: linear-gradient(90deg, #f5576c, #ff6b6b);
  }

  /* 新增的客流指标进度条样式 */
  .company-flow-fill {
    background: linear-gradient(90deg, #48bb78, #38a169);
  }

  .store-flow-fill {
    background: linear-gradient(90deg, #ed8936, #dd6b20);
  }

  /* 分页样式 */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 15px 0;
    border-top: 1px solid #e2e8f0;
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

  /* 分析结论样式 */
  .analysis-conclusion {
    margin-top: 30px;
    padding: 25px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    border: 1px solid #e2e8f0;
    backdrop-filter: blur(10px);
  }

  .conclusion-title {
    font-size: 1.3rem;
    font-weight: bold;
    color: #4a5568;
    margin-bottom: 20px;
    text-align: center;
    padding-bottom: 10px;
    border-bottom: 2px solid #e2e8f0;
  }

  .conclusion-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 15px;
  }

  .conclusion-card {
    padding: 15px;
    background: #f8fafc;
    border-radius: 10px;
    border-left: 4px solid #667eea;
    transition: transform 0.3s ease;
  }

  .conclusion-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .conclusion-card h5 {
    margin: 0 0 10px 0;
    color: #4a5568;
    font-size: 1.1rem;
  }

  .conclusion-card p {
    margin: 0;
    color: #718096;
    line-height: 1.5;
    font-size: 0.9rem;
  }

  /* 响应式设计 */
  @media (max-width: 1400px) {
    .summary-stats {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .data-table {
      font-size: 10px;
      min-width: 1200px;
    }
    
    .data-table th,
    .data-table td {
      padding: 8px 6px;
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
      min-width: auto;
    }
    
    .search-input {
      flex: 1;
      max-width: none;
    }
    
    .control-group {
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    .table-content-wrapper {
      gap: 15px;
    }
    
    .summary-stats {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      padding: 12px;
    }
    
    .search-section {
      flex-direction: column;
      gap: 10px;
    }
    
    .search-input {
      width: 100%;
    }
    
    .table-wrapper {
      max-height: 500px;
    }
    
    .data-table {
      font-size: 9px;
      min-width: 1000px;
    }
    
    .data-table th,
    .data-table td {
      padding: 6px 4px;
    }
    
    .pagination {
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .page-btn {
      padding: 8px 14px;
      font-size: 13px;
    }

    .conclusion-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .summary-stats {
      grid-template-columns: 1fr;
      padding: 10px;
    }
    
    .table-wrapper {
      max-height: 400px;
    }
    
    .pagination {
      flex-direction: column;
      gap: 10px;
    }
    
    .page-info {
      order: -1;
      margin: 0;
    }

    .analysis-conclusion {
      padding: 15px;
    }

    .conclusion-card {
      padding: 12px;
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

  /* 高对比度模式支持 */
  @media (prefers-contrast: high) {
    .search-input,
    .page-select,
    .page-btn {
      border-color: #000;
    }
    
    .page-btn {
      color: #000;
    }
  }

  /* 减少动画模式支持 */
  @media (prefers-reduced-motion: reduce) {
    .data-row,
    .percent-fill,
    .page-btn,
    .search-input,
    .conclusion-card {
      transition: none;
    }
  }

  /* 打印样式 */
  @media print {
    .table-controls,
    .pagination {
      display: none;
    }
    
    .table-wrapper {
      max-height: none;
      overflow: visible;
      border: 1px solid #000;
    }
    
    .data-table th {
      background: #f0f0f0 !important;
      color: #000 !important;
    }
    
    .summary-stats {
      border: 1px solid #000;
      background: #f9f9f9;
    }

    .analysis-conclusion {
      page-break-before: always;
    }
  }
</style>