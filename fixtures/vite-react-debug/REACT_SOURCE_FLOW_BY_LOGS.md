# React 源码执行全流程（基于当前日志与注释）

本文基于本仓库里你已经加好的日志体系：

- `[ReactSource:L1]`：主链路（面试级）
- `[ReactSource:L2]`：关键细节（函数级）
- `[ReactSource:L3]`：实现细节（分支/递归级）
- `[ReactSource: Hook]`：Hooks 专项链路

目标：从一次 `root.render(...)` 出发，用“时序 + 源码位置 + 日志”把 React 运行过程串起来。

---

## 0. 入口代码（你项目里的触发点）

```tsx
import {createRoot} from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

这两句分别触发：

1. `createRoot(...)`：初始化 React Root 容器
2. `root.render(...)`：把 ReactElement 入队并调度执行

---

## 1. 初始化阶段（L1: 01）

### 1.1 `createRoot`（react-dom）
- 文件：`packages/react-dom/src/client/ReactDOMRoot.js`
- 关键函数：`createRoot`
- 作用：
  - 校验 container
  - 解析 options
  - 调 `createContainer` 进入 reconciler
  - 绑定 root 与容器
  - 注册事件系统
  - 返回 `ReactDOMRoot` 实例

对应主日志（示例）：
- `[ReactSource:L1] 01 初始化/Reconciler: ... createRoot -> createContainer ...`

### 1.2 `createContainer -> createFiberRoot`（reconciler）
- 文件：
  - `packages/react-reconciler/src/ReactFiberReconciler.js`
  - `packages/react-reconciler/src/ReactFiberRoot.js`
- 关键函数：
  - `createContainer`
  - `createFiberRoot`
- 作用：
  - 创建 `FiberRootNode`
  - 创建 `HostRoot Fiber`
  - 建立 `root.current <-> HostRootFiber.stateNode` 双向关联
  - 初始化 updateQueue

对应主日志：
- `[ReactSource:L1] 01 初始化/Fiber架构: createContainer -> createFiberRoot ...`

---

## 2. ReactElement / JSX 阶段（L1: 02）

### 2.1 JSX -> ReactElement
- 文件：`packages/react/src/jsx/ReactJSXElement.js`
- 关键函数：`jsxDEV`（开发环境）
- 说明：
  - JSX 编译后调用 `jsxDEV` 创建 ReactElement 对象
  - 手写 `React.createElement` 也会落到同类 ReactElement 创建逻辑

对应主日志：
- `[ReactSource:L1] 02 ReactElement/JSX: ...`
- `[ReactSource:L1] 02 ReactElement/虚拟 DOM: ...`

---

## 3. 入队与调度阶段（L1: 03/04）

### 3.1 `root.render` -> `updateContainer`
- 文件：
  - `packages/react-dom/src/client/ReactDOMRoot.js`
  - `packages/react-reconciler/src/ReactFiberReconciler.js`
- 关键函数：
  - `ReactDOMRoot.prototype.render`
  - `updateContainer`
- 作用：
  - 创建 update
  - 把 update 放入 `HostRootFiber.updateQueue`
  - 进入 `scheduleUpdateOnFiber`

对应主日志：
- `[ReactSource:L1] 03 入队调度/Reconciler: ... root.render -> updateContainer ...`

### 3.2 Lane 优先级
- 文件：`packages/react-reconciler/src/ReactFiberLane.js`
- 关键函数：
  - `requestUpdateLane`
  - `markRootUpdated`
  - `getNextLanes`
- 作用：
  - 给本次更新分配 lane（优先级）
  - 写入 `root.pendingLanes`
  - 调度前选出本轮该执行的 lanes

对应主日志：
- `[ReactSource:L1] 03 入队调度/Lane 优先级: ...`
- `[ReactSource:L1] 04 Lane 优先级: ... getNextLanes ...`

### 3.3 Scheduler 注册任务
- 文件：
  - `packages/react-reconciler/src/ReactFiberRootScheduler.js`
  - `packages/scheduler/src/forks/Scheduler.js`
- 关键函数：
  - `ensureRootIsScheduled`
  - `unstable_scheduleCallback`
  - `workLoop`
- 作用：
  - 把 root work 包装成 task 入队
  - 由 Scheduler 按优先级与超时策略执行

对应主日志：
- `[ReactSource:L1] 04 Scheduler: ensureRootIsScheduled -> unstable_scheduleCallback ...`
- `[ReactSource:L1] 04 Scheduler: requestHostCallback -> workLoop ...`

---

## 4. Render 阶段（L1: 05）

Render 的本质：构建/复用 workInProgress Fiber 树，收集副作用 flags。

### 4.1 入口：同步与并发
- 文件：`packages/react-reconciler/src/ReactFiberWorkLoop.js`
- 关键函数：
  - 同步：`performSyncWorkOnRoot -> renderRootSync`
  - 并发：`performConcurrentWorkOnRoot -> renderRootConcurrent`

对应主日志：
- `[ReactSource:L1] 05 Render阶段: ... performSyncWorkOnRoot ...`
- `[ReactSource:L1] 05 concurrent 并发: ... performConcurrentWorkOnRoot ...`
- `[ReactSource:L1] 05 时间切片: ... workLoopConcurrent ...`

### 4.2 Fiber 双缓存（current / workInProgress）
- 文件：`packages/react-reconciler/src/ReactFiber.js`
- 关键函数：`createWorkInProgress`
- 作用：
  - 基于 current 创建/复用 alternate（WIP）
  - 形成双缓存模型（current <-> alternate）

对应主日志：
- `[ReactSource:L1] 05 Render阶段/Fiber双缓存: ... createWorkInProgress ...`

### 4.3 `performUnitOfWork -> beginWork`
- 文件：
  - `packages/react-reconciler/src/ReactFiberWorkLoop.js`
  - `packages/react-reconciler/src/ReactFiberBeginWork.js`
- 关键函数：
  - `performUnitOfWork`
  - `beginWork`
- 作用：
  - 递阶段：按 Fiber.tag 处理节点
  - 通过 `reconcileChildren` 生成/复用子 Fiber

对应主日志：
- `[ReactSource:L1] 05 Render阶段: performUnitOfWork -> beginWork ...`

### 4.4 Diff / ChildReconciler
- 文件：`packages/react-reconciler/src/ReactChildFiber.js`
- 关键点：
  - `mountChildFibers = ChildReconciler(false)`
  - `reconcileChildFibers = ChildReconciler(true)`
- 含义：
  - mount：不追踪最小副作用（减少首屏无意义 flags）
  - update：追踪 Placement/Deletion/Update 等副作用

对应日志：
- L1：Diff 相关总览
- L2/L3：`reconcileChildren*`, `ChildReconciler*`, `reconcileChildrenArray` 等

### 4.5 `completeUnitOfWork -> completeWork`
- 文件：
  - `packages/react-reconciler/src/ReactFiberWorkLoop.js`
  - `packages/react-reconciler/src/ReactFiberCompleteWork.js`
  - `packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js`
- 作用：
  - 归阶段：创建真实 DOM（mount）或生成更新 payload（update）
  - 冒泡子树 flags 到父节点

对应主日志：
- `[ReactSource:L1] 05 Render阶段: ... completeWork ...`
- L2/L3：`createInstance`, `appendAllChildren`, `prepareUpdate` 等

---

## 5. Commit 阶段（L1: 06）

Render 结束后拿到 `finishedWork`，进入 commit（不可中断）。

### 5.1 总入口
- 文件：`packages/react-reconciler/src/ReactFiberWorkLoop.js`
- 关键函数：
  - `commitRoot`
  - `commitRootImpl`

对应主日志：
- `[ReactSource:L1] 06 Commit阶段: Render 阶段完成后得到 finishedWork ...`

### 5.2 before mutation
- 文件：`packages/react-reconciler/src/ReactFiberCommitWork.js`
- 关键函数：
  - `commitBeforeMutationEffects`
  - `commitBeforeMutationEffectsOnFiber`
- 作用：
  - DOM 变更前读取快照
  - 类组件 `getSnapshotBeforeUpdate`

对应主日志：
- `[ReactSource:L1] 06 Commit阶段: commitRoot 首先进入 before mutation ...`

### 5.3 mutation（真实 DOM 写入核心）
- 文件：
  - `packages/react-reconciler/src/ReactFiberCommitWork.js`
  - `packages/react-reconciler/src/ReactFiberCommitHostEffects.js`
- 关键函数：
  - `commitMutationEffects`
  - `commitHostPlacement`
  - `commitHostUpdate`
  - `commitHostTextUpdate`
  - `commitHostRemoveChild*`
- 作用：
  - 插入 / 更新 / 删除真实 DOM
  - 然后切换 `root.current`

对应主日志：
- `[ReactSource:L1] 06 Commit阶段: ... Renderer 在这里把变更写入真实 DOM ...`

### 5.4 layout
- 文件：
  - `packages/react-reconciler/src/ReactFiberCommitWork.js`
  - `packages/react-reconciler/src/ReactFiberCommitEffects.js`
- 关键函数：
  - `commitLayoutEffects`
  - `commitLayoutEffectOnFiber`
  - `commitAttachRef`
- 作用：
  - 执行 `useLayoutEffect` create
  - 执行类组件 didMount/didUpdate
  - 绑定 ref

对应主日志：
- `[ReactSource:L1] 06 Commit阶段: mutation 完成并切换 root.current 后进入 layout ...`

---

## 6. Hook 专项链路（[ReactSource: Hook]）

相关核心文件：
- `packages/react-reconciler/src/ReactFiberHooks.js`
- `packages/react-reconciler/src/ReactFiberNewContext.js`

### 6.1 useState
- `mountState`：创建 hook 节点与 queue，返回 dispatch
- `updateState`：走 reducer 流程，消费更新队列计算新 state

### 6.2 useEffect
- `mountEffect`：注册 PassiveEffect
- `updateEffect`：deps 比较；变化时打 `HookHasEffect`
- 真正执行在 commit passive 阶段（`commitHookPassiveMountEffects` / `commitHookPassiveUnmountEffects`）

### 6.3 useRef
- `mountRef`：创建 `{current}`
- `updateRef`：直接复用同一个 ref 对象

### 6.4 useMemo / useCallback
- `mountMemo` / `mountCallback`：记录值/函数与 deps
- `updateMemo` / `updateCallback`：deps 命中直接复用，未命中重新计算/替换

### 6.5 useContext
- `readContext`：读取 context 当前值并登记到 Fiber.dependencies
- 让 context 变化时能正确命中该消费者的更新

---

## 7. 一句话时序总览（面试可直接背）

1. `createRoot` 初始化 Root 与 HostRoot Fiber  
2. `root.render` 把 ReactElement 包成 update 入队  
3. Lane 计算优先级，Scheduler 注册 task  
4. Render 阶段构建/复用 Fiber 树（beginWork/completeWork）并收集副作用  
5. Commit 阶段按 before mutation -> mutation -> layout 提交  
6. mutation 子阶段由 Renderer 把变更写进真实 DOM  
7. passive 阶段执行 `useEffect` 的 destroy/create

---

## 8. 配套文档

- 调试流程与重装依赖说明：`/Users/daixiaofeng/xf-source-code/react/fixtures/vite-react-debug/README.md`
- 日志映射表（快速查源码）：`/Users/daixiaofeng/xf-source-code/react/fixtures/vite-react-debug/LOG_SOURCE_STAGE_MAP.md`

