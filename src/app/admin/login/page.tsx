import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-10">
      <h1 className="text-3xl font-semibold">Admin Login</h1>
      <LoginForm />
    </main>
  );
}
