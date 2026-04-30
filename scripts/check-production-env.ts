type Rule = {
  key: string;
  required: boolean;
  description: string;
};

const RULES: Rule[] = [
  { key: "DATABASE_URL", required: true, description: "数据库连接串" },
  { key: "NEXTAUTH_SECRET", required: true, description: "认证签名密钥" },
  { key: "NEXTAUTH_URL", required: true, description: "线上站点 URL" },
  { key: "STRIPE_SECRET_KEY", required: true, description: "Stripe 服务端密钥" },
  { key: "STRIPE_WEBHOOK_SECRET", required: true, description: "Stripe Webhook 验签密钥" },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", required: true, description: "Stripe 前端公钥" },
  { key: "RESEND_API_KEY", required: false, description: "邮件服务密钥（未配置则仅日志降级）" },
  { key: "MAIL_FROM", required: false, description: "邮件发件人" },
  { key: "REDIRECTS_ENABLED", required: false, description: "重定向开关" },
];

function mask(value: string): string {
  if (value.length <= 8) {
    return "***";
  }
  return `${value.slice(0, 4)}***${value.slice(-2)}`;
}

function runCheck(): void {
  let hasError = false;
  console.log("生产环境变量检查：");
  for (const rule of RULES) {
    const value = process.env[rule.key];
    if (value) {
      console.log(`- [OK] ${rule.key} (${rule.description}) = ${mask(value)}`);
      continue;
    }
    if (rule.required) {
      console.log(`- [ERROR] ${rule.key} 缺失 (${rule.description})`);
      hasError = true;
    } else {
      console.log(`- [WARN] ${rule.key} 未配置 (${rule.description})`);
    }
  }
  if (hasError) {
    process.exit(1);
  }
}

runCheck();
