import { ELEMENT_TEXT } from './constants';

/**
 * 创建虚拟Dom的方法
 * @param {*} type 元素类型 div span p
 * @param {*} config 配置对象  元素属性
 * @param  {...any} children 所有的儿子，这里会做成一个数组
 */
function createElement(type, config, ...children) {
  delete config.__self;
  delete config.__source;

  // 做了兼容处理，如果是文本类型，返回元素对象
  const newChildren = children.map(child => {
    // child是一个React.createElement返回的React元素
    if (typeof child === 'object') return child;
    // child是字符串
    return {
      type: ELEMENT_TEXT,
      props: { text: child, children: [] },
    };
  });
  return {
    type,
    props: {
      ...(config || {}), // 有可能为null
      children: newChildren,
    },
  };
}

const React = {
  createElement,
};

export default React;
