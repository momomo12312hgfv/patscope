# patscope

> 看清 GitHub Token 的爆炸半径，然后把它缩小。

[English](README.md) | 简体中文

`gh auth status` 只告诉你 Token 有哪些 scope，却不会告诉你这些 scope 真正意味着什么。

`patscope` 会把 Token 变成一张能力地图、一个风险评分，以及一份最小权限配方。它完全在本地运行，不会打印 Token，只会访问 `api.github.com`。

## 演示

```text
$ patscope scan --gh-account octocat

patscope 0.1.0
identity   @octocat
token      ghp_****...redacted (classic PAT)
scopes     6

Blast radius  CRITICAL ████████████████████ 100/100

Top risks
  ! Delete repositories [repo:delete]
    Permanently delete repositories, including all code, issues and releases.
    granted by delete_repo
  ! Manage organization [org:admin]
    Add or remove members, change roles, manage teams, settings and organization secrets.
    granted by admin:org
  ! Modify GitHub Actions workflows [workflow:write]
    Add or change workflow files, which can execute code and expose repository secrets.
    granted by workflow
```

## 为什么做这个

Token 是一种“看不见的权力”。一个同时拥有 `repo`、`workflow` 和 `delete_repo` 的 Token，可以读取所有私有代码、篡改 CI、甚至删掉整个仓库。大多数人只有在出事之后才会意识到这一点。

`patscope` 回答三个问题：

1. 这个 Token 一旦泄露，最坏能做什么？
2. 是哪些 scope 造成的？
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

# 从环境变量读取 Token
GH_TOKEN=ghp_... patscope scan

# 从 stdin 读取，避免进入 shell 历史
cat token.txt | patscope scan --token-stdin

# 输出 Markdown 报告
patscope scan --format markdown > report.md

# CI 门禁：高风险及以上退出码为 2
patscope scan --fail-on high

# 离线评估 scope，不发任何网络请求
patscope scan --offline --scopes repo,workflow,delete_repo --login octocat

# 解释单个 scope
patscope explain repo

# 查看最小权限配方
patscope recipe push
patscope recipe ci
patscope recipe release
```

## 评分规则

| 等级 | 权重 | 最低分 |
| --- | --- | --- |
| critical | 50 | 70 |
| high | 20 | 45 |
| medium | 8 | 20 |
| low | 2 | 0 |

总分最高 100。最终分数取“加权总分”和“最高等级对应的最低分”中的较大值，避免单个 critical 能力（例如 `delete_repo`）被低估。

评分用于沟通风险，不是 CVSS 替代品；每项能力都会列出授予它的 scope，方便自行核对。

## 支持范围

| Token 类型 | v0.1 支持情况 |
| --- | --- |
| Classic PAT (`ghp_`) | 完整扫描 |
| OAuth (`gho_`) | 完整扫描 |
| Fine-grained PAT (`github_pat_`) | 仅识别类型和身份；GitHub API 不暴露细粒度权限，可配合 `--offline --scopes` |
| GitHub App user (`ghu_`) | 仅识别身份 |
| GitHub App server (`ghs_`) | 仅统计安装的仓库数量 |
| GitHub App refresh (`ghr_`) | 拒绝扫描 |

## 隐私与安全

- Token 只会发送到 `api.github.com`
- 报告中的 Token 一律脱敏
- Token 不落盘
- 没有遥测、统计或崩溃上报
- 推荐使用 `--token-stdin` 或 `--gh-account`，避免把 Token 写进 shell 历史

## 限制

- GitHub API 不暴露 fine-grained PAT 的权限，patscope 不会猜
- scope 矩阵针对 classic OAuth scopes
- 组织成员信息来自 `/user/orgs`，私有成员关系可能不可见
- Token 的创建时间和过期时间无法通过 API 获取
- 评分是启发式的，用来开启讨论，而不是结束讨论

## 开发

```bash
bun install
bun run typecheck
bun test
bun run build
bun run build:all
bun run docs
```

## 许可证

MIT，详见 [LICENSE](LICENSE)。
