import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Register | RoadResQ",
  description: "Create a new Customer or Mechanic account on RoadResQ",
};

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]">
      <RegisterForm />
    </div>
  );
}
