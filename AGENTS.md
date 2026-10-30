## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

使用`kebab-case`格式来命名文件

使用vertical slices架构

需要使用tailwind css来编写样式

每一个组件文件都不允许超过 250 行代码

禁止使用硬编码，每一个可定制的内容都要写入`config.ts`文件中，并且根据模块来分组

图片一律使用Astro的Image组件

不要使用secondary的说明文字

要注意响应式布局，包括PC、pad、minipad和phone
