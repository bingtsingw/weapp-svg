# weapp-svg

> 像使用普通react组件一样使用iconfont图标  
> 灵感来源: [taro-iconfont-cli](https://github.com/iconfont-cli/taro-iconfont-cli) [taro-iconfont-svg](https://github.com/HongxuanG/taro-iconfont-svg)

> :warning: 目前仅支持生成taro的react tsx组件

## 为什么又造一个轮子

其他项目生成方式是将所有图标生成到一个文件中, 然后通过`<IconFont name="xxx" />`的方式来使用, 而本项目为每一个图标单独生成一个组件, 如下:

```text
./iconfont
├── icons
│   ├── home.tsx
│   ├── user.tsx
│   ├── shop.tsx
│   ├── ......
├── index.ts
└── utils.ts
```

然后我们就可以直接`import`单独的图标来使用了:

```jsx
import { IconHome } from 'path/to/icon';

const Page = () => {
  return <IconHome />;
};
```

由于每个图标为一个单独的组件, 你可以方便地复制一个或多个图标到任意项目.  
甚至可以创建一个图标库供多个项目使用, 不用担心与本地项目图标调用方式冲突:

```jsx
import { IconHome, IconTag } from '@my-package/icon';
import { IconBusiness, IconProject } from 'path/to/icon';
```

其他优点还包括:

1. 按需打包, 节省体积
2. 编译时报错, 如果图标删了, 直接import无法编译通过
3. 方便共享

## 安装

> :warning: 下文中涉及`npm`操作均使用[@antfu/ni](https://github.com/antfu/ni)命令替代.

```shell
ni @wesvg/cli -D
wesvg generate
```

## 示例

查看[examples](examples)目录寻找相关项目示例.

## 使用

### Step1

生成配置:

```shell
na wesvg init
```

此时项目根目录会生成一个`wesvg.json`的文件，内容如下：

```shell
{
  "inputs": "",
  "output": "",
  "iconTrimPrefix": "",
  "iconSize": "",
  "iconComponentPrefix": ""
}
```

可以查看[demo](examples/taro3-react/wesvg.json)了解各个配置的用法.

### Step2

生成组件:

```shell
na wesvg generate

```

`wesvg generate`也可以传入`wesvg.json`中的配置, 并且命令行配置会覆盖`wesvg.json`中的配置, 例如:

```shell
na wesvg generate --inputs ./iconfont --output ./src/components/icons --icon-trim-prefix icon --icon-size 16
```

## TODO

1. 使用svgo优化图标
