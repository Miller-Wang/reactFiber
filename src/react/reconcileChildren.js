import {
  TAG_CLASS,
  TAG_FUNCTION_COMPONENT,
  ELEMENT_TEXT,
  TAG_TEXT,
  TAG_HOST,
  UPDATE,
  PLACEMENT,
  DELETION,
} from './constants';
import { UpdateQueue } from './UpdateQueue';

/**
 * 创建fiber 构建fiber树
 * @param {*} currentFiber 当前fiber
 * @param {*} newChildren 当前节点的子节点，虚拟dom数组
 */
export function reconcileChildren(currentFiber, newChildren, deletions) {
  let newChildIndex = 0; //新虚拟DOM数组中的索引
  // 老的父fiber的第一个子fiber
  let oldFiber = currentFiber.alternate && currentFiber.alternate.child;
  if (oldFiber) oldFiber.firstEffect = oldFiber.lastEffect = oldFiber.nextEffect = null;

  let prevSibling;
  while (newChildIndex < newChildren.length || oldFiber) {
    const newChild = newChildren[newChildIndex];

    // 两个节点是不是相同类型 span div...
    const sameType = oldFiber && newChild && newChild.type === oldFiber.type;
    let newFiber;
    let tag;

    // class 会被编译成函数，所以用function判断， 用 isReactComponent来判断是否是类组件
    if (
      newChild &&
      typeof newChild.type === 'function' &&
      newChild.type.prototype.isReactComponent
    ) {
      tag = TAG_CLASS;
    } else if (newChild && typeof newChild.type === 'function') {
      // 函数组件
      tag = TAG_FUNCTION_COMPONENT;
    } else if (newChild && newChild.type === ELEMENT_TEXT) {
      tag = TAG_TEXT; //文本
    } else if (newChild && typeof newChild.type === 'string') {
      tag = TAG_HOST; //原生DOM组件
    }

    // 类型相同就更新，不同就重新创建插入
    if (sameType) {
      // 更新
      if (oldFiber.alternate) {
        // 双缓冲机制，复用老的fiber
        newFiber = oldFiber.alternate;
        newFiber.props = newChild.props;
        newFiber.alternate = oldFiber;
        newFiber.effectTag = UPDATE;
        newFiber.updateQueue = oldFiber.updateQueue || new UpdateQueue();
      } else {
        newFiber = {
          tag: oldFiber.tag, //原生DOM组件
          type: oldFiber.type, //具体的元素类型
          props: newChild.props, //新的属性对象
          stateNode: oldFiber.stateNode, //复用老fiber的dom
          return: currentFiber, //父Fiber
          alternate: oldFiber, //上一个Fiber 指向旧树中的节点
          effectTag: UPDATE, //更新节点
          updateQueue: oldFiber.updateQueue || new UpdateQueue(),
        };
      }
    } else {
      // 新建
      if (newChild) {
        // 创建fiber
        newFiber = {
          tag, //原生DOM组件
          type: newChild.type, //具体的元素类型
          props: newChild.props, //新的属性对象
          stateNode: null, //stateNode肯定是空的
          return: currentFiber, //父Fiber
          effectTag: PLACEMENT, //插入节点
          updateQueue: new UpdateQueue(),
        };
      }
      if (oldFiber) {
        oldFiber.effectTag = DELETION;
        deletions.push(oldFiber);
      }
    }

    // 构建fiber链表
    if (newFiber) {
      if (newChildIndex === 0) {
        currentFiber.child = newFiber; //第一个子节点挂到父节点的child属性上
      } else {
        prevSibling.sibling = newFiber;
      }
      prevSibling = newFiber; //然后newFiber变成了上一个哥哥了
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    newChildIndex++;
  }
}
