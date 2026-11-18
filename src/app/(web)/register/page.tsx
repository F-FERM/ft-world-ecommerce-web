import AuthShell from "@/src/components/auth/AuthShell";
import RegisterForm from "@/src/components/auth/RegisterForm";


export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" subtitle="Create your FT World account and enjoy seamless shopping.">
      <RegisterForm />
    </AuthShell>
  );
}