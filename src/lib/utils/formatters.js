export const formatNumber = (num) => {
  return new Intl.NumberFormat('zh-CN').format(num);
};

export const formatPercent = (num) => {
  return `${num.toFixed(1)}%`;
};

export const formatLargeNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
};