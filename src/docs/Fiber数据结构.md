### fiber 数据结构

```js
let fiberNode = {
    tag, // fiber类型  Host/Root
    type, // 虚拟dom的类型 div/span, 如果是类组件，这里是类名
    props, // 虚拟dom的属性
    stateNode, // 真实dom，如果是类组件，这里是类的实例
    // 构建链表的三个指针
    child, // 指向大儿子
    sibling, // 指向二弟
    return, // 指向父节点
    // 构建Effect List的指针
    firstEffect, // 第一个有副作用的子节点
    nextEffect,
    lastEffect,
    effectTag, // 副作用类型 插入、更新、删除
}

```
