# dsh-wechat-skin 🟢

把 DeepSeek Harness（DSH）的界面换成**微信 Windows 电脑版**观感的皮肤插件。

> 纯原生 DSH 双面插件（与 [dsh-dream-skin](https://github.com/RevolutionLA/dsh-dream-skin) 同构），
> 基于官方 `--dsw-*` 设计令牌 + `ctx.theme.overrideTokens` + `ctx.slots` 扩展点实现。
> **不注入、不改安装包、不因 DSH 升级失效。**

[English](./README.en.md)

## 📸 预览

![preview](docs/preview.png)

---

## ✨ 功能一览

| 模块 | 效果 |
|---|---|
| 🟢 最左侧功能窄条 | 56px 灰色（`#DEDEE4`）图标栏：顶部=你的头像（点击上传换头像），下方最多 6 个功能图标（灰色线条 SVG，可自定义） |
| 📋 会话列表 | `#E6E6E8` 面板；**实心绿 `#15AC70` 选中行 + 白字**；两行式（标题 + 最后消息副标题小字）；**40px 圆角方形真人头像**（每会话固定、刷新不变） |
| 💬 消息气泡 | 你的消息=右侧浅绿气泡 `#95EC69`；AI 回复=左侧白色气泡；8px 圆角 + 微信式小尾巴；**气泡顶边与头像顶边齐平** |
| 👤 消息头像 | 你（右）= 上传/默认头像；AI（左）= **当前会话在侧栏的头像**（随会话切换） |
| 🔤 字体 | 微软雅黑（微信 Windows 默认）；你的消息与 AI 回复字号一致、无加粗；**5 档字号可调**（默认中间档） |
| ⌨️ 输入框 | 通栏白色、四边 `#E0E0E0` 边框 + 圆角；**上下边缘都可拖拽调整高度**（持久化）；右下角矩形「发送」按钮（空输入灰/有内容微信绿） |
| 🖼️ 头像 | **默认生成彩色首字母头像**（确定性、持久化稳定）；可选运行脚本下载 **100 张真实人像**（80 女 / 20 男）；**支持上传自己的头像** |
| 🌓 深浅色 | 仅浅色生效；系统深色模式自动回退 DSH 官方外观 |

---

## 🚀 快速安装（3 步）

```sh
# 1. 安装（本地目录或 npm 发布包）
dsh plugin --profile desktop add -w /path/to/dsh-wechat-skin

# 2. 重启 DSH Desktop

# 3. 皮肤默认自动生效；如需开关：设置 → 通用（General）→ 微信皮肤
```

> 若 `dsh plugin add` 报 workspace 错误，补 `-w` 即可。

---

## ⚙️ 设置项（设置 → 通用 → 微信皮肤）

| 设置 | 说明 |
|---|---|
| 启用/停用 | 一键切换皮肤（停用即还原官方外观） |
| 字体大小（5 档） | 小 / 较小 / 标准 / 较大 / 大，默认「标准」（当前字号） |
| 上传我的头像 | 选择本地图片（自动压缩 128px），替换你的头像（窄条/消息/侧栏同步） |
| 最左侧功能栏 | 勾选最多 6 个功能图标（新会话/设置/外观/模型/插件/工作区/关于） |

---

## 📁 目录结构

```
dsh-wechat-skin/
├── package.json          # 双面插件声明（dsh.bundle + dsh.client）
├── cordis.patch.yml      # 向 profile 插入 loader 入口
├── lib/
│   ├── index.js          # 宿主半边（空操作）
│   ├── client.js         # 浏览器半边（已构建，头像池为空时用生成头像回退）
│   └── types/            # 类型声明
├── src/
│   └── wechat-skin.css   # 结构性样式（构建时注入 lib/client.js）
├── scripts/
│   ├── download-avatars.js  # 下载头像池 → avatars.json（不提交仓库）
│   └── build.js             # 将 avatars.json + src/wechat-skin.css 注入 lib/client.js
├── docs/                 # 预览图等
├── LICENSE               # MIT
├── CHANGELOG.md
└── README.md / README.en.md
```

---

## 🛠️ 自定义开发

```sh
# 重新生成头像池（80 女 + 20 男，来自 randomuser.me）
node scripts/download-avatars.cjs

# 重新构建 lib/client.js（把 avatars.json + src/wechat-skin.css 注入）
node scripts/build.cjs
```

改样式：编辑 `src/wechat-skin.css` 后运行 `node scripts/build.cjs`，再刷新 DSH 页面（`Ctrl+F5`）即可。

---

## 📌 说明与限制

- **纯外观改造**：不删除/移动任何功能入口；代码块、工具调用、附件等富内容全部保留（样式弱化为微信式灰条）。
- **副标题**：插件渐进式记录「打开过的会话」的最后一条消息（localStorage）；未打开过的会话暂无副标题。
- **设置分区深链**：窄条里的「外观/模型/插件」等图标点击后打开设置页并尽力定位到对应分区（DSH 无分区深链 API，个别分区可能停在设置页）。
- **侧边栏自动收起**：窗口 <1024px 时 DSH 会内置收起侧边栏，属 DSH 自身响应式行为（皮肤无法覆盖）。
- **深色模式**：皮肤仅作用于浅色；深色下自动回退官方外观。

## 🙏 致谢

架构参考 DeepSeek Harness 官方 `ui-theme` 客户端包，插件形态参考 [dsh-dream-skin](https://github.com/RevolutionLA/dsh-dream-skin)。

## 📄 协议

[MIT](./LICENSE)
