# 生产发布检查清单（P5-4 / P5-5）

## 1. 发布前环境检查

- 执行：`npm run check:prod-env`
- 必填项必须全部为 `OK`：
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- 可选项（建议配置）：
  - `RESEND_API_KEY`
  - `MAIL_FROM`

## 2. 构建与部署

- 执行：`npm run lint`
- 执行：`npm run build`
- 在 Vercel（或同类平台）部署后确认：
  - 首页可访问
  - 关键路由正常：`/course-finder`、`/booking-form`、`/admin/login`
  - API 可访问：`/api/health`

## 3. 支付链路检查（Stripe）

- 后台创建一个测试 booking（或通过前台提交）
- 发起 checkout 并完成测试支付
- 验证：
  - `payments` 生成并变更为 `SUCCEEDED`
  - `bookings.status` 变更为 `DEPOSIT_PAID`
  - webhook 返回 2xx

## 4. 邮件链路检查

- 提交 booking 后应触发“提交确认邮件”
- 支付成功后应触发“定金到账邮件”
- 若未配置 `RESEND_API_KEY`，系统应降级为日志，不影响主流程

## 5. 运行健康检查

- 请求：`GET /api/health`
- 期望：
  - `database.status = ok`
  - `stripe.status = ok`（生产要求）
  - `mail.status = ok`（建议）

## 6. 上线后巡检（首日）

- 关注错误日志与 webhook 失败重试
- 抽样检查后台记录：
  - `contacts`
  - `booking_enquiries`
  - `bookings`
  - `payments`
- 确认 sitemap 可访问：`/sitemap.xml`
