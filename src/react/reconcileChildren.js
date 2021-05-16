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

/**
 * 创建fiber 构建fiber树
 * @param {*} currentFiber 当前fiber
 * @param {*} newChildren 当前节点的子节点，虚拟dom数组
 */
export function reconcileChildren(currentFiber, newChildren) {
  let newChildIndex = 0; //新虚拟DOM数组中的索引
  let prevSibling;
  while (newChildIndex < newChildren.length) {
    const newChild = newChildren[newChildIndex];
    let tag;
    if (newChild && newChild.type === ELEMENT_TEXT) {
      tag = TAG_TEXT; //文本
    } else if (newChild && typeof newChild.type === 'string') {
      tag = TAG_HOST; //原生DOM组件
    }
    // 创建fiber
    let newFiber = {
      tag, //原生DOM组件
      type: newChild.type, //具体的元素类型
      props: newChild.props, //新的属性对象
      stateNode: null, //stateNode肯定是空的
      return: currentFiber, //父Fiber
      effectTag: PLACEMENT, //副作用标识
      nextEffect: null,
    };

    // 构建fiber链表
    if (newChildIndex === 0) {
      currentFiber.child = newFiber; //第一个子节点挂到父节点的child属性上
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber; //然后newFiber变成了上一个哥哥了

    newChildIndex++;
  }
}
