# 支付对账说明（Admin × Stripe）

适用场景：运营同学每日/每周核对后台 `payments` 与 Stripe Dashboard 数据一致性。

## 1. 对账目标

- 确认每一笔已支付定金都存在于：
  - 后台 `Admin / Payments`
  - Stripe Dashboard `Payments`
- 确认关键字段一致：
  - 金额（`amount`）
  - 币种（`currency`）
  - 状态（`SUCCEEDED` / `PENDING` / `FAILED` / `EXPIRED`）
  - 会话号（`stripeSessionId`）

## 2. 后台数据导出

1. 进入 `Admin / Payments`
2. 点击 `Export CSV`
3. 保存当日导出文件（建议命名：`payments-YYYYMMDD.csv`）

## 3. Stripe 数据导出

1. 登录 Stripe Dashboard
2. 打开 `Payments` 列表，筛选同一时间窗口
3. 导出 CSV（或使用 Dashboard 列表核对）

## 4. 字段映射关系

- 后台 `Payment ID`：内部主键，仅内部定位
- 后台 `Booking ID`：对应业务预订号
- 后台 `Session ID`：对应 Stripe Checkout Session（用于精确匹配）
- Stripe `Payment Intent`：可作为辅助定位（如后台已记录 `stripePaymentIntentId`）

## 5. 建议核对步骤

1. 先按 `Session ID` 做一一匹配（优先）
2. 再核对金额和状态
3. 对 `PENDING` 长时间未变更的记录重点检查：
   - webhook 是否投递成功
   - Stripe 事件是否存在签名/重试错误
4. 对 `FAILED/EXPIRED` 记录，与 booking 状态联动检查是否符合预期

## 6. 常见异常与处理

- **后台有记录，Stripe 无记录**
  - 检查是否使用了错误环境（测试/生产）
  - 检查创建 checkout 后是否被取消且未完成支付
- **Stripe 成功，后台仍是 PENDING**
  - 优先检查 webhook 接收与签名配置
  - 查看服务日志中的 webhook 错误信息
- **金额不一致**
  - 检查提交时传入的 amount 单位（系统使用最小货币单位）

## 7. 对账留档建议

- 每次对账输出一条简要记录：
  - 时间
  - 对账范围（日期/批次）
  - 异常数量
  - 已处理结果
