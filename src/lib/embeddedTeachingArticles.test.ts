import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const categoryRoot = ["小车组", "电控"]
  .map((category) => resolve("src", "content", "blog", category))
  .find(existsSync);

assert.ok(categoryRoot, "应能找到嵌入式教学文章一级目录");

const teachingSeries = [
  "PID算法",
  "RTOS-任务调度器",
  "滤波算法与陀螺仪驱动",
  "灰度及循迹环PID",
];

const forbiddenPhrases = [
  "解压",
  "压缩包",
  "代码包",
  "资料包",
  "本篇只解读",
  "独立解读",
  "## 证据边界",
  "## 动手练习",
  "读完后应该能回答",
];

const articlePaths = teachingSeries.flatMap((series) => {
  const seriesRoot = resolve(categoryRoot, series);
  return readdirSync(seriesRoot, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => resolve(entry.parentPath, entry.name));
});

test("嵌入式专题保持教学文档口吻", () => {
  assert.equal(articlePaths.length, 13, "专题文章数量发生变化时应同步更新教学审查范围");

  for (const articlePath of articlePaths) {
    const source = readFileSync(articlePath, "utf8");

    assert.match(source, /^## 本篇总结$/m, `${articlePath} 应以本篇总结收尾`);
    for (const phrase of forbiddenPhrases) {
      assert.ok(!source.includes(phrase), `${articlePath} 不应包含资料整理口吻：${phrase}`);
    }
  }
});
