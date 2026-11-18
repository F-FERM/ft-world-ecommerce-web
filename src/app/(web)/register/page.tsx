import AuthShell from "@/src/components/auth/AuthShell";
import RegisterForm from "@/src/components/auth/RegisterForm";


export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" subtitle="It only takes a minute.">
      <RegisterForm />
    </AuthShell>
  );
}