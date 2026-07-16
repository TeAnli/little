const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_WEEK = 7;

/**
 * 将 ISO 时间字符串格式化为中文风格的相对时间描述。
 * 根据当前时间与给定时间的差值，依次返回“刚刚”、“X分钟前”、“X小时前”、“X天前”，
 * 超过 7 天则转为标准日期格式（YYYY-MM-DD）。若传入无效日期，则原样返回。
 * @param {string} isoString - 符合 ISO 8601 格式的时间字符串（如 '2026-07-16T10:30:00Z'）
 * @returns {string} 相对时间描述、格式化日期或原字符串（无效时）
 * @example
 * timeAgo('2026-07-16T10:00:00Z') // 若当前为 10:05，可能返回 '5 分钟前'
 */
export function timeAgo(isoString: string): string {
  const date = new Date(isoString);
  // 无效日期直接返回原字符串，避免错误计算
  if (isNaN(date.getTime())) {
    return isoString;
  }

  const now = Date.now();
  const diffInMilliseconds = now - date.getTime();

  // 处理未来时间：视为“刚刚”，也可根据需求改为“未来”
  if (diffInMilliseconds < 0) {
    return '刚刚';
  }

  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / SECONDS_PER_MINUTE);
  const diffInHours = Math.floor(diffInMinutes / MINUTES_PER_HOUR);
  const diffInDays = Math.floor(diffInHours / HOURS_PER_DAY);

  if (diffInSeconds < SECONDS_PER_MINUTE) {
    return '刚刚';
  }
  if (diffInMinutes < MINUTES_PER_HOUR) {
    return `${diffInMinutes} 分钟前`;
  }
  if (diffInHours < HOURS_PER_DAY) {
    return `${diffInHours} 小时前`;
  }
  if (diffInDays < DAYS_PER_WEEK) {
    return `${diffInDays} 天前`;
  }
  // 超过一周则展示具体日期
  return formatDate(isoString);
}

/**
 * 将 ISO 时间字符串格式化为简单的日期字符串（YYYY-MM-DD）。
 * 如果传入的字符串无法解析为有效日期，则原样返回该字符串。
 * @param {string} isoString - 符合 ISO 8601 格式的时间字符串
 * @returns {string} 格式化后的日期（如 '2026-07-16'）或原字符串（若无效）
 * @example
 * formatDate('2026-07-16T10:30:00Z') // '2026-07-16'
 * formatDate('invalid')              // 'invalid'
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return isoString;
  }

  const year = date.getFullYear();
  // 月份和日期补零至两位
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}