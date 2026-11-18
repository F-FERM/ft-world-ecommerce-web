import AuthShell from "@/src/components/auth/AuthShell";
import LoginForm from "@/src/components/auth/LoginForm";


export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to your account to continue.">
      <LoginForm />

    </AuthShell>
  );
}