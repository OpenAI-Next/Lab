---
title: 个人项目
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.23"
---

# 个人项目

Base URLs:

- <a href="https://api.gptgod.online">api.gptgod.online: https://api.gptgod.online</a>

# Authentication

- HTTP Authentication, scheme: bearer

# gptgod/luma

## POST /generations Copy

POST /v1/luma/generations

> Body 请求参数

```json
{
  "user_prompt": "A teddy bear in sunglasses playing electric guitar, dancing and headbanging in the jungle in front of a large beautiful waterfall",
  "aspect_ratio": "16:9",
  "expand_prompt": true
}
```

### 请求参数

| 名称 | 位置 | 类型   | 必选 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| body | body | object | 否   | none |

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

## POST /task Copy

POST /v1/luma/task

> Body 请求参数

```json
{
  "user_prompt": "A teddy bear in sunglasses playing electric guitar, dancing and headbanging in the jungle in front of a large beautiful waterfall",
  "aspect_ratio": "16:9",
  "expand_prompt": true
}
```

### 请求参数

| 名称 | 位置 | 类型   | 必选 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| body | body | object | 否   | none |

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

# 数据模型
