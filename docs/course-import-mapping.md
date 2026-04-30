# 课程 CSV 导入字段映射

## 必填列

- `title`：课程标题
- `slug`：课程唯一标识（URL slug）
- `ageMin`：最小年龄（整数）
- `ageMax`：最大年龄（整数，必须 >= ageMin）
- `categorySlug`：课程分类 slug（必须已存在于 `Category` 表）
- `locationSlug`：校区 slug（必须已存在于 `Location` 表）

## 可选列

- `description`：课程描述
- `price`：价格（整数，留空则为 null）
- `currency`：币种（留空默认 `GBP`）
- `promoLabel`：促销标签
- `isPublished`：是否发布（`true/false/1/0/yes/no`，留空默认为 `true`）

## 示例

```csv
title,slug,description,ageMin,ageMax,price,currency,promoLabel,isPublished,categorySlug,locationSlug
Harrow School Summer English,harrow-summer-english,English summer camp,9,17,2500,GBP,Popular,true,english-courses,london
```

## 导入方式

- 后台页面：`/admin/courses/import`
- 命令行：
  - `npm run import:courses -- ./data/courses.csv`
  - `npm run import:courses -- ./data/courses.csv createOnly`

## 模式说明

- `upsert`：按 `slug` 查重；存在则更新，不存在则新增
- `createOnly`：按 `slug` 查重；存在则跳过，不存在则新增
