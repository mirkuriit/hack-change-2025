"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthInput } from "@/components/auth/auth-input";

const registerSchema = z.object({
  login: z.string().min(3, "Минимум 3 символа"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { login: "", password: "" },
  });

  const onSubmit = async (values: RegisterForm) => {
    try {
      const { data } = await api.post("/users", values);
      setUser({
        id: data?.id ?? null,
        login: data?.login ?? null,
      });
      router.push("/login");
    } catch (error) {
      console.error(
        "Register request failed: ",
        error instanceof Error ? error.message : String(error)
      );
    }
  };

  return (
    <AuthFormShell
      title="Зарегистрироваться"
      onSubmit={handleSubmit(onSubmit)}
      headingAlign="left"
      footerAlign="left"
      footer={
        <p>
          У вас есть аккаунт?{" "}
          <Link
            href="/login"
            className="font-medium text-[#1a6bff] hover:underline"
          >
            Войти
          </Link>
        </p>
      }
    >
      <AuthInput
        type="text"
        placeholder="Логин"
        label="Логин"
        hideLabel
        {...register("login")}
        error={errors.login?.message}
      />
      <AuthInput
        type="password"
        placeholder="Пароль"
        label="Пароль"
        hideLabel
        {...register("password")}
        error={errors.password?.message}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[#1a6bff] py-3 text-base font-semibold text-white transition hover:bg-[#1557d1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a6bff] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Загрузка..." : "Зарегистрироваться"}
      </button>
    </AuthFormShell>
  );
}
