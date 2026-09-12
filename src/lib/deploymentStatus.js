/** @param {unknown} status @param {unknown} conclusion */
export function normalizeDeploymentStatus(status, conclusion) {
  if (typeof status === 'string' && ['queued', 'in_progress', 'waiting', 'pending', 'requested'].includes(status)) return 'pending';
  if (status !== 'completed') return 'unavailable';
  if (conclusion === 'success') return 'success';
  if (typeof conclusion === 'string' && ['failure', 'timed_out', 'startup_failure'].includes(conclusion)) return 'failure';
  // 取消、跳过与未知结论不证明部署失败，更不能证明当前线上站点故障。
  return 'unavailable';
}
