import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="auth-page-shell">
      <SignUp />
    </div>
  );
}
