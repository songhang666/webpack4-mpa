#  鉴于公司还有多页面应用的需求,温故而知新下webpack4的一些配置~该脚手架适用于开发小型多页面应用。

### 使用：

```
npm install
npm run  dev // 开发模式 8090端口
npm run build // 构建
```

装包有问题出门右转 =>  http://npm.taobao.org/

###  适用范围：此脚手架可基于jquery做PC端项目，亦然可用zepto做H5移动端页面

# 所运用的：
**1.引入 normalize.css 消除浏览器差异**

**2.引入 autoprefixer css 自动添加前缀**

**3.结合淘宝 flexible自适应方案（以750设计稿为准）
使用时引入flexible.js，设计稿多少px，css就写多少px，sass函数自动转换为rem,记得装ruby环境，本人用的webstorm的 file watcher，别的编辑器配置手动google**


**4.模块化支持commonJS和ES6 module规范**


**5.移动端调试支持eurda可视化调试（鸣谢作者，记得给作者点小星星 https://github.com/liriliri/eruda）**

**6.art-template实现高效渲染,后缀art的文件为模板文件（如果有更高效的渲染方案欢迎提出）**

**7.支持sass语法（不管什么css预编译器都完全ok，只要自己顺手）**

**8.引入weixin-js-sdk，支持微信sdk**

附：[webpack4 一些迁移指南](https://webpack.docschina.org/)
一些缓存优化和分包加载方面的内容尚未考虑。如有不妥请大佬提出。