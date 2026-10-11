# 从 git 历史挖掘修改历史

HISTORY.md 的素材主要来自 git。目标不是复制 git log，而是找出**方向性变化和被遗忘的 why**。

## 挖掘命令

```bash
# 组件的完整演变（跨重命名追踪）
git log --follow --oneline -- internal/runner/

# 找「谁改动了这行/这个符号」——定位可疑代码的来历
git log -S 'RabbitMQ' --oneline -- internal/transport/
git log -G 'sync\.Send' --oneline -- internal/cache/

# 按主题搜提交信息
git log --grep='revert\|rollback\|回退' -i --oneline
git log --grep='fix\|incident\|故障' -i --oneline -- internal/runner/

# 某段代码最后由谁在哪个提交改的
git blame -L 120,145 internal/runner/task.go

# 提交的作者分布（判断哪些区域 churn 高——高频改动区值得写历史）
git shortlog -sn -- internal/runner/

# merge / PR 上下文（GitHub）
gh pr list --search "runner" --state merged --limit 30
```

重点关注的提交形状：

- **revert 类**：尝试过又被放弃的方案，最有价值的素材；
- **大 diff 单提交 + 模糊信息**（"refactor", "optimize"）：背后常有没写下来的动机，列为 C 级推测去向维护者求证；
- **深夜紧急修复**（时间戳 + fix）：多半对应一次故障；
- **同一文件反复拉锯**：存在未解决的权衡，值得写成一条历史 + 一条待办。

## 证据分级

每条写进 HISTORY.md 的原因都要标注来源：

| 等级 | 来源 | 处理方式 |
|---|---|---|
| A | PR / issue / 事故记录 / 设计文档中明写 | 直接引用并附链接 |
| B | 维护者口述确认 | 标注「B：维护者 YYYY-MM-DD 确认」 |
| C | 从 diff / 命名 / 时间线推测 | 必须显式标注「C：推测」，bootstrap 结束时集中请维护者升级或删除 |

## 防编造清单

AI 整理历史时最容易犯的是**给改动编一个合理化的动机**。自查：

1. 这个原因在 commit message / PR / issue 里真的写着吗？——没有就降到 C 级；
2. 我是在陈述证据，还是在讲一个顺滑的故事？
3. 日期、提交号、作者是否原样摘录，没有「四舍五入」？
4. 同一事实在 DECISIONS 和 HISTORY 里是否一致？

## 输出要求

- 一条历史一个主题，不按提交流水记账；
- 每条带「当前影响」——这段往事对现在的修改意味着什么（这是 agent 读历史的唯一目的）；
- 关联到具体提交号，让记录可回查。
