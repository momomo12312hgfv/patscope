# patscope

> 看清 GitHub Token 的爆炸半径，然后把它缩小。

[English](README.md) | 简体中文

`gh auth status` 只告诉你 Token 有哪些 scope，却不会告诉你这些 scope 真正意味着什么。

`patscope` 会把 Token 变成一张能力地图、一个风险评分，以及一份最小权限配方。它完全在本地运行，不会打印 Token，只会访问 `api.github.com`。

v0.2 新增：fine-grained PAT 权限评估、仓库访问探测、SARIF 输出、GitHub Action。

## 演示

```text
$ patscope scan --gh-account octocat \
    --permissions contents=write,pull_requests=write,metadata=read

patscope 0.2.0
identity    @octocat
token       github_pat_****...redacted (fine-grained PAT)
scopes      none
permissions 3 (self-reported)
source      gh:octocat

Blast radius  HIGH  █████████░░░░░░░░░░░ 45/100 (raw 22)

Top risks
  ! Write repository contents [code:write]
    Push commits, rewrite branches, edit issues and pull requests, and publish releases.
    granted by repo.contents=write, repo.pull_requests=write
```

## 为什么做这个

Token 是一种“看不见的权力”。一个同时拥有 `repo`、`workflow` 和 `delete_repo` 的 Token，可以读取所有私有代码、篡改 CI、甚至删掉整个仓库。Fine-grained PAT 权限更小，但 GitHub API 不暴露它的权限，开发者仍然只能靠记忆判断。

`patscope` 回答三个问题：

1. 这个 Token 一旦泄露，最坏能做什么？
2. 是哪些 scope 或 permission 造成的？
3. 完成我的工作，最小需要什么权限？

## 安装

从 [Releases](https://github.com/momomo12312hgfv/patscope/releases) 下载对应平台的二进制：

- `patscope-linux-x64`
- `patscope-linux-arm64`
- `patscope-darwin-x64`
- `patscope-darwin-arm64`
- `patscope-windows-x64.exe`

从源码构建需要 [Bun](https://bun.sh) 1.2+：

```bash
git clone https://github.com/momomo12312hgfv/patscope.git
cd patscope
bun install
bun run build
```

## 使用

```bash
# 扫描当前 gh CLI 账号
patscope scan --gh-account octocat

# 从环境变量读取 classic PAT
GH_TOKEN=ghp_... patscope scan

# 从 stdin 读取，避免进入 shell 历史
cat token.txt | patscope scan --token-stdin

# fine-grained PAT：提供你授予的权限
patscope scan --token-stdin \
  --permissions contents=write,pull_requests=write,metadata=read

# 探测指定仓库的只读访问权限
patscope scan --repos owner/repo,owner/other --permissions contents=read

# 输出 Markdown / SARIF
patscope scan --format markdown > report.md
patscope scan --format sarif > patscope.sarif

# CI 门禁：高风险及以上退出码为 2
patscope scan --fail-on high

# 离线评估，不发任何网络请求
patscope scan --offline \
  --permissions contents=write,workflows=write,metadata=read \
  --login octocat

# 解释 scope 或 fine-grained permission
patscope explain repo
patscope explain contents=write
patscope explain --permissions

# 查看最小权限配方
patscope recipe push
patscope recipe ci
patscope recipe release
```

### Fine-grained 权限

GitHub API 不暴露 fine-grained PAT 的权限，所以 `--permissions` 是**用户自报**，报告中会明确标注。

权限名按资源命名空间区分：

```bash
--permissions repo.contents=write,repo.workflows=write,repo.metadata=read
```

当短名不冲突时，可以简写为 `contents=write`。如果同名权限存在于多个资源（例如 `repo.administration` 和 `org.administration`），必须写全名。

完整列表见 [docs/permission-matrix.md](docs/permission-matrix.md)。

### GitHub Action

```yaml
name: Token check

on:
  workflow_dispatch:

permissions:
  contents: read
  security-events: write

jobs:
  patscope:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: momomo12312hgfv/patscope@v0.2.0
        with:
          token: ${{ secrets.PAT_TO_SCAN }}
          fail-on: high
          format: sarif
          output-file: patscope.sarif
          permissions: contents=read,metadata=read
      - uses: github/codeql-action/upload-sarif@v4
        if: always()
        with:
          sarif_file: patscope.sarif
```

Action 会写 step summary、设置 `score` / `level` / `report` 输出，并在超过阈值时让 job 失败。详见 [docs/action.md](docs/action.md)。

### 输出格式

| 格式 | 用途 |
| --- | --- |
| `terminal` | 终端阅读（默认） |
| `markdown` | Issue、PR、报告 |
| `json` | 自动化、看板 |
| `sarif` | Code Scanning 等 SARIF 消费方 |

### 退出码

| 退出码 | 含义 |
| --- | --- |
| `0` | 扫描完成，未达到 `--fail-on` 阈值 |
| `1` | 输入错误、Token 被拒绝、网络/API 错误 |
| `2` | 评分达到或超过 `--fail-on` 阈值 |

## 检查内容

- Token 类型（classic PAT、fine-grained PAT、OAuth、GitHub App Token）
- Classic OAuth scopes 及其能力
- 自报的 fine-grained permissions 及其能力
- 身份、计划、组织成员关系（只读）
- 可选的仓库只读访问探测
- 当前 API 限流
- 未知 scope、权限和不支持的 Token 类型
- 加权爆炸半径评分和逐项能力明细

`patscope` 不会读取仓库内容、下载代码或修改任何东西，只执行只读 `GET` 请求。

## 评分规则

| 等级 | 权重 | 最低分 |
| --- | --- | --- |
| critical | 50 | 70 |
| high | 20 | 45 |
| medium | 8 | 20 |
| low | 2 | 0 |

总分最高 100。最终分数取“加权总分”和“最高等级对应的最低分”中的较大值，避免单个 critical 能力（例如 `delete_repo`）被低估。

评分用于沟通风险，不是 CVSS 替代品；每项能力都会列出授予它的 scope 或 permission。完整矩阵见 [docs/scope-matrix.md](docs/scope-matrix.md)。

## 支持范围

| Token 类型 | v0.2 支持情况 |
| --- | --- |
| Classic PAT (`ghp_`) | 完整扫描 |
| OAuth (`gho_`) | 完整扫描 |
| Fine-grained PAT (`github_pat_`) | 通过 `--permissions` 自报权限；GitHub API 不暴露权限 |
| GitHub App user (`ghu_`) | 仅识别身份 |
| GitHub App server (`ghs_`) | 仅统计安装的仓库数量 |
| GitHub App refresh (`ghr_`) | 拒绝扫描 |

## 隐私与安全

- Token 只会发送到 `api.github.com`
- 报告中的 Token 一律脱敏
- Token 不落盘
- 没有遥测、统计或崩溃上报
- 推荐使用 `--token-stdin` 或 `--gh-account`，避免把 Token 写进 shell 历史
- 详见 [docs/threat-model.md](docs/threat-model.md) 和 [SECURITY.md](SECURITY.md)

## 限制

- Fine-grained 权限是用户自报，无法通过 GitHub API 验证
- 仓库探测是只读的，不测试写、删除或管理权限
- scope 矩阵针对 classic OAuth scopes
- 组织成员信息来自 `/user/orgs`，私有成员关系可能不可见
- Token 的创建时间和过期时间无法通过 API 获取
- 评分是启发式的，用来开启讨论，而不是结束讨论

## 路线图

- **v0.3** — 仓库级爆炸半径、Token 对比、签名发布、策略文件
- **v1.0** — 稳定的 JSON schema、组织与仓库检查、更广的 Token 覆盖

## 开发

```bash
bun install
bun run typecheck
bun test
bun run build
bun run build:action
bun run build:all
bun run docs
```

## 许可证

MIT，详见 [LICENSE](LICENSE)。
