# 鉴于公司还有多页面应用的营销需求，温故而知新下 webpack 的一些知识~
该脚手架目前基本可用开发小型多页面。

使用

```
npm i
npm run  dev // 开发模式 8090端口
npm run build // 构建
```

装包有问题请出门右转 http://npm.taobao.org/
webpack4搭建多页面应用环境，可基于jquery做PC端项目，亦然可以用zepto做H5移动端页面

引入 normalize.css 消除浏览器差异
### postcss

autoprefixer css 自动添加前缀

### 添加类似模板那样的头部、尾部、身部页面拼装

### 根据 src 目录下的目录结构自动生成 html 模板和配置 webpack 的入口文件

## 结合淘宝flexible自适应方案（以750设计稿为准）
使用时引入flexible.js，设计稿多少px，css就写多少px，sass函数自动转换为rem,记得装ruby环境，本人用的webstorm的file watcher，别的编辑器自行百度

## 模块化支持commonJS和ES6 module规范

## 移动端调试支持eurda可视化调试

## art-template实现高效渲染,后缀art的文件为模板文件（如果有更高效的渲染方案欢迎提出）

## 支持sass预编译

附：[webpack4 一些迁移指南](https://github.com/dwqs/blog/issues/60)
一些缓存优化和分包加载方面的内容尚未考虑。如有不妥请大佬指出。