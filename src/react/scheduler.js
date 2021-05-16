import {
  TAG_HOST,
  TAG_ROOT,
  TAG_TEXT,
  PLACEMENT,
  DELETION,
  UPDATE,
  ELEMENT_TEXT,
} from './constants';
import { reconcileChildren } from './reconcileChildren';
import { setProps } from './utils';

let workInProgressRoot = null; //正在渲染中的根Fiber
let nextUnitOfWork = null; //下一个工作单元

let currentRoot = null; //当前的根Fiber
let deletions = []; //要删除的fiber节点

// 暴露给外部
export function scheduleRoot(rootFiber) {
  if (currentRoot && currentRoot.alternate) {
    // 第一次之后的更新
    // 双缓冲机制，复用之前的fiber对象
    workInProgressRoot = currentRoot.alternate;
    workInProgressRoot.alternate = currentRoot;
    if (rootFiber) {
      // 更新复用fiber节点的props
      workInProgressRoot.props = rootFiber.props;
    }
  } else if (currentRoot) {
    // 第一次更新
    rootFiber.alternate = currentRoot;
    workInProgressRoot = rootFiber;
  } else {
    workInProgressRoot = rootFiber;
  }

  // 清除effect list
  workInProgressRoot.firstEffect = workInProgressRoot.lastEffect = null;
  nextUnitOfWork = workInProgressRoot;
}

// 1.工作循环，每帧结束都会执行
function workLoop(deadline) {
  let shouldYield = false; // 是否暂停
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && workInProgressRoot) {
    console.log('调和阶段结束');
    commitRoot();
  }

  //不管有没有任务，都请求再次调度 每一帧都要执行一次workLoop,检查有没有要执行的任务
  requestIdleCallback(workLoop, { timeout: 500 });
}

// 2.执行每个fiber的工作
function performUnitOfWork(currentFiber) {
  beginWork(currentFiber);
  // 先遍历大儿子
  if (currentFiber.child) {
    return currentFiber.child;
  }
  while (currentFiber) {
    // 没有子节点的先完成
    completeUnitOfWork(currentFiber);
    // 看看有没有弟弟，有的话遍历弟弟
    if (currentFiber.sibling) {
      return currentFiber.sibling;
    }
    // 子节点都完成了，让父亲完成，父亲是root节点，return是null, 跳出while循环
    currentFiber = currentFiber.return;
  }
}

// 3.开始工作
// 两个功能：1.创建真实DOM 2.创建子fiber
function beginWork(currentFiber) {
  switch (currentFiber.tag) {
    case TAG_ROOT:
      updateHostRoot(currentFiber);
      break;
    case TAG_TEXT:
      updateHostText(currentFiber);
      break;
    case TAG_HOST:
      updateHost(currentFiber);
      break;
    default:
      break;
  }
}

// 根fiber， stateNode是外部传入的
function updateHostRoot(currentFiber) {
  const newChildren = currentFiber.props.children;
  reconcileChildren(currentFiber, newChildren, deletions);
}

// 文本类型
function updateHostText(currentFiber) {
  // 没有创建真实dom，进行创建
  // 文本类型，不存在子节点，不需要执行reconcileChildren
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber);
  }
}

// 原生类型
function updateHost(currentFiber) {
  // 没有创建真实dom，进行创建
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber);
  }
  const newChildren = currentFiber.props.children;
  reconcileChildren(currentFiber, newChildren, deletions);
}

// 创建真实dom
function createDOM(currentFiber) {
  if (currentFiber.tag === TAG_TEXT) {
    return document.createTextNode(currentFiber.props.text);
  } else if (currentFiber.tag === TAG_HOST) {
    // span div 这些原生标签
    const stateNode = document.createElement(currentFiber.type);
    updateDOM(stateNode, {}, currentFiber.props);
    return stateNode;
  }
}

// 更新真实dom的属性
function updateDOM(stateNode, oldProps, newProps) {
  // 存在，而且是个真实dom
  if (stateNode && stateNode.setAttribute) {
    setProps(stateNode, oldProps, newProps);
  }
}

// 4.完成工作，收集有副作用的fiber，构建effect list
//每个fiber有两个属性 firstEffect指向第一个有副作用的子fiber lastEffect 指儿 最后一个有副作用子Fiber
//中间的用nextEffect做成一个单链表 firstEffect=大儿子.nextEffect二儿子.nextEffect三儿子 lastEffect
/**
step1. 没有子节点的大儿子先完成
returnFiber和currentFiber 的firstEffect、lastEffect都为空
returnFiber.firstEffect = 大儿子
returnFiber.lastEffect = 大儿子


step2. 没有子节点的弟弟完成
returnFiber.firstEffect = 大儿子
returnFiber.lastEffect = 大儿子
currentFiber 的firstEffect、lastEffect为空

returnFiber.lastEffect.nextEffect = currentFiber = 弟弟; 
returnFiber.lastEffect = currentFiber = 弟弟;

// step3. 父节点完成
returnFiber的firstEffect、lastEffect为空
currentFiber.firstEffect = 大儿子
currentFiber.lastEffect = 弟弟
大儿子.nextEffect = 弟弟

returnFiber.firstEffect = currentFiber.firstEffect;
(父节点的父节点.firstEffect = 大儿子)

returnFiber.lastEffect = currentFiber.lastEffect;
（父节点的父节点.lastEffect = 弟弟）

将父节点挂在 弟弟 后面
returnFiber.lastEffect(弟弟).nextEffect = currentFiber(父节点);

父节点的父节点的lastEffect指向 父节点
returnFiber.lastEffect = currentFiber;

// step4.下个单元完成
让上一单元的lastEffect.nextEffect 指向下一单元的firstEffect
returnFiber.lastEffect.nextEffect = currentFiber.firstEffect;

 */

// step1. 没有子节点的大儿子先完成，returnFiber和currentFiber 的firstEffect、lastEffect都为空
// 将 returnFiber的firstEffect、lastEffect都指向 currentFiber(大儿子)

// step2. 没有子节点的弟弟完成，currentFiber 的firstEffect、lastEffect为空，
// 执行 returnFiber.lastEffect.nextEffect = currentFiber; returnFiber.lastEffect = currentFiber;
// 大儿子的nextEffect指向弟弟，父节点的lastEffect指向弟弟

// step3. 父节点完成, returnFiber的firstEffect、lastEffect为空，currentFiber
function completeUnitOfWork(currentFiber) {
  let returnFiber = currentFiber.return;
  if (!returnFiber) return;

  if (!returnFiber.firstEffect) {
    returnFiber.firstEffect = currentFiber.firstEffect;
  }

  if (currentFiber.lastEffect) {
    if (returnFiber.lastEffect) {
      // 让上一单元的lastEffect.nextEffect 指向下一单元的firstEffect
      returnFiber.lastEffect.nextEffect = currentFiber.firstEffect;
    }
    returnFiber.lastEffect = currentFiber.lastEffect;
  }

  // 有effectTag，说明有副作用，需要收集
  if (currentFiber.effectTag) {
    if (returnFiber.lastEffect) {
      returnFiber.lastEffect.nextEffect = currentFiber;
    } else {
      returnFiber.firstEffect = currentFiber;
    }
    returnFiber.lastEffect = currentFiber;
  }
}

// -----------commit阶段-----------

function commitRoot() {
  deletions.forEach(commitWork);
  let currentFiber = workInProgressRoot.firstEffect;
  while (currentFiber) {
    commitWork(currentFiber);
    currentFiber = currentFiber.nextEffect;
  }
  // 提交完成
  deletions.length = 0;
  // 清除effect list
  workInProgressRoot.firstEffect = workInProgressRoot.lastEffect = null;
  currentRoot = workInProgressRoot;
  workInProgressRoot = null;
}

function commitWork(currentFiber) {
  if (!currentFiber) return;
  let returnFiber = currentFiber.return;
  const domReturn = returnFiber.stateNode;

  if (currentFiber.effectTag === PLACEMENT && currentFiber.stateNode) {
    //如果是新增DOM节点
    domReturn.appendChild(currentFiber.stateNode);
  } else if (currentFiber.effectTag === DELETION) {
    // 删除
    domReturn.removeChild(currentFiber.stateNode);
  } else if (currentFiber.effectTag === UPDATE && currentFiber.stateNode) {
    // 更新
    if (currentFiber.type === ELEMENT_TEXT) {
      if (currentFiber.alternate.props.text !== currentFiber.props.text) {
        currentFiber.stateNode.textContent = currentFiber.props.text;
      } else {
        updateDOM(currentFiber.stateNode, currentFiber.alternate.props, currentFiber.props);
      }
    } else {
    }
  }

  currentFiber.effectTag = null;
}

requestIdleCallback(workLoop, { timeout: 500 });
