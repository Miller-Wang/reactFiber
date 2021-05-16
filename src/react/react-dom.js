import { TAG_ROOT } from './constants';
import { scheduleRoot } from './scheduler';

/**
 * 把一个元素渲染到容器内部
 * @param {*} element 渲染的元素 虚拟Dom
 * @param {*} container 挂载的节点
 */
function render(element, container) {
  let rootFiber = {
    tag: TAG_ROOT, // 根fiber
    stateNode: container, // 真实dom节点
    //props.children是一个数组，里面放的是React元素 虚拟DOM 后面会根据每个React元素创建 对应的Fiber
    props: { children: [element] },
  };
  // 开始调度
  scheduleRoot(rootFiber);
}

const ReactDOM = {
  render,
};

export default ReactDOM;
