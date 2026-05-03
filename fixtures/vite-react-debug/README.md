# vite-react-debug

这个 fixture 用来调试本仓库本地构建出来的 React 包。

当前依赖来自：

```json
"react": "file:/Users/daixiaofeng/xf-source-code/react/build/oss-experimental/react",
"react-dom": "file:/Users/daixiaofeng/xf-source-code/react/build/oss-experimental/react-dom",
"scheduler": "file:/Users/daixiaofeng/xf-source-code/react/build/oss-experimental/scheduler"
```

也就是说，浏览器里跑的不是 npm 上的 React，而是 React 仓库 `build/oss-experimental` 里的构建产物。

## 首次使用

在 React 仓库根目录先构建本地包：

```bash
cd /Users/daixiaofeng/xf-source-code/react
yarn build react/index,react/jsx,react-dom/index,react-dom/client,scheduler --type=NODE_DEV
```

进入 fixture 安装依赖并启动：

```bash
cd /Users/daixiaofeng/xf-source-code/react/fixtures/vite-react-debug
yarn install
yarn dev
```

打开 Vite 输出的地址，例如：

```text
http://localhost:5173/
```

## 修改 React 源码后的固定流程

如果你在 `packages/*` 里改了 `console.log('[ReactSource:...]')`，不要只重启 `yarn dev`。必须重新构建 React 包，并刷新 fixture 的本地依赖和 Vite 预构建缓存。

按这个顺序来：

```bash
cd /Users/daixiaofeng/xf-source-code/react
yarn build react/index,react/jsx,react-dom/index,react-dom/client,scheduler --type=NODE_DEV

cd /Users/daixiaofeng/xf-source-code/react/fixtures/vite-react-debug
rm -rf node_modules/.vite node_modules/react node_modules/react-dom node_modules/scheduler
yarn install --force
yarn dev --force
```

然后在浏览器里强刷页面，并清空 Console 过滤条件。

## 为什么要这么做

React 源码修改后，`fixtures/vite-react-debug` 不会自动读取 `packages/*` 源码。

实际链路是：

```text
packages/* 源码
  -> yarn build
  -> build/oss-experimental/react*
  -> fixture node_modules/react*
  -> Vite node_modules/.vite 预构建缓存
  -> 浏览器
```

所以如果漏掉任意一步，都可能看到旧 log：

- 只改 `packages/*`，但没重新 `yarn build`：`build/oss-experimental` 还是旧代码。
- 重新 build 了，但没刷新 fixture 的 `node_modules/react*`：Yarn 可能还用旧的 `file:` 安装结果。
- 刷新了依赖，但没清 `node_modules/.vite`：Vite 可能还在用旧的预构建依赖。
- dev server 没加 `--force`：Vite 可能不会重新 optimize React 依赖。

## 快速确认是否拿到新包

先确认构建产物里有你的 log：

```bash
cd /Users/daixiaofeng/xf-source-code/react
rg "ReactSource:L1" build/oss-experimental/react build/oss-experimental/react-dom build/oss-experimental/scheduler
```

再确认 fixture 的 `node_modules` 里也有：

```bash
cd /Users/daixiaofeng/xf-source-code/react/fixtures/vite-react-debug
rg "ReactSource:L1" node_modules/react node_modules/react-dom node_modules/scheduler
```

如果第一个有、第二个没有，说明 fixture 依赖没刷新，重新执行：

```bash
rm -rf node_modules/react node_modules/react-dom node_modules/scheduler
yarn install --force
```

如果第二个有、浏览器没有，说明多半是 Vite 或浏览器缓存，重新执行：

```bash
rm -rf node_modules/.vite
yarn dev --force
```

## 推荐 Console 过滤

只看一级面试关键词：

```text
[ReactSource:L1]
```

看某个关键词：

```text
[ReactSource:L1] Render阶段
```

看完整链路：

```text
ReactSource
```
