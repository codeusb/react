# React 调试日志对照表（Log -> Source -> Stage）

这份文档用于快速把控制台日志映射到 React 源码位置与执行阶段。

## 主流程对照（L1/L2）

| 日志关键词 | 源码文件 | 关键函数 | 阶段 |
|---|---|---|---|
| `[ReactSource:L1] 01 初始化/Reconciler` | `/Users/daixiaofeng/xf-source-code/react/packages/react-dom/src/client/ReactDOMRoot.js` | `createRoot` | 初始化 |
| `[ReactSource:L1] 01 初始化/Fiber架构` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberRoot.js` | `createFiberRoot` | 初始化 |
| `[ReactSource:L1] 02 ReactElement/JSX` | `/Users/daixiaofeng/xf-source-code/react/packages/react/src/jsx/ReactJSXElement.js` | `jsxDEV` | JSX 编译产物创建 |
| `[ReactSource:L1] 03 入队调度/Reconciler` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberReconciler.js` | `updateContainer` | Render 前调度入口 |
| `[ReactSource:L1] 03 入队调度/Lane 优先级` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberLane.js` | `requestUpdateLane` / `markRootUpdated` | 优先级计算 |
| `[ReactSource:L1] 04 Scheduler` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberRootScheduler.js` | `ensureRootIsScheduled` | 调度注册 |
| `[ReactSource:L1] 05 Render阶段` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberWorkLoop.js` | `performSyncWorkOnRoot` / `renderRootSync` | Render |
| `[ReactSource:L1] 05 时间切片` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberWorkLoop.js` | `workLoopConcurrent` | Render（并发可中断） |
| `[ReactSource:L1] 05 Render阶段 beginWork` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberBeginWork.js` | `beginWork` | Render 递阶段 |
| `[ReactSource:L1] 05 Render阶段 completeWork` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberCompleteWork.js` | `completeWork` | Render 归阶段 |
| `[ReactSource:L1] 06 Commit阶段 ... before mutation` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberCommitWork.js` | `commitBeforeMutationEffects` | Commit / before mutation |
| `[ReactSource:L1] 06 Commit阶段 ... Renderer 在这里把变更写入真实 DOM` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberCommitWork.js` | `commitMutationEffects` | Commit / mutation |
| `[ReactSource:L2] commitHostPlacement` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberCommitHostEffects.js` | `commitHostPlacement` | Commit / mutation（插入 DOM） |
| `[ReactSource:L2] commitHostUpdate` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberCommitHostEffects.js` | `commitHostUpdate` | Commit / mutation（更新 DOM 属性与事件） |
| `[ReactSource:L2] commitHostTextUpdate` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberCommitHostEffects.js` | `commitHostTextUpdate` | Commit / mutation（更新文本） |
| `[ReactSource:L1] 06 Commit阶段 ... 进入 layout` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberCommitWork.js` | `commitLayoutEffects` | Commit / layout |

## Hook 对照（[ReactSource: Hook]）

| 日志关键词 | 源码文件 | 关键函数 | 阶段 |
|---|---|---|---|
| `[ReactSource: Hook] useState(mount)` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberHooks.js` | `mountState` | Render（函数组件执行中） |
| `[ReactSource: Hook] useState(update)` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberHooks.js` | `updateState` | Render |
| `[ReactSource: Hook] useEffect(mount)` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberHooks.js` | `mountEffect` | Render 注册，Commit passive 执行 |
| `[ReactSource: Hook] useEffect(update)` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberHooks.js` | `updateEffect` | Render 对比 deps，Commit passive 执行 |
| `[ReactSource: Hook] useRef(mount)` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberHooks.js` | `mountRef` | Render |
| `[ReactSource: Hook] useRef(update)` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberHooks.js` | `updateRef` | Render |
| `[ReactSource: Hook] useMemo(mount)` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberHooks.js` | `mountMemo` | Render |
| `[ReactSource: Hook] useMemo(update)` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberHooks.js` | `updateMemo` | Render |
| `[ReactSource: Hook] useCallback(mount)` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberHooks.js` | `mountCallback` | Render |
| `[ReactSource: Hook] useCallback(update)` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberHooks.js` | `updateCallback` | Render |
| `[ReactSource: Hook] useContext(read)` | `/Users/daixiaofeng/xf-source-code/react/packages/react-reconciler/src/ReactFiberNewContext.js` | `readContext` | Render（读取并登记 context 依赖） |

## 快速使用建议

- 想看“为什么更新被触发”：先看 `03 入队调度` + `Lane 优先级`。
- 想看“为什么页面改了”：重点看 `06 Commit阶段` + `commitHost*`。
- 想看“Hook 到底做了什么”：直接筛选 `[ReactSource: Hook]`。
