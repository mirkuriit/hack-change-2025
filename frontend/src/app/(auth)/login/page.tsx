"use client";

import { setCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { decodeUserToken } from "@/lib/token";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthInput } from "@/components/auth/auth-input";

const loginSchema = z.object({
  login: z.string().min(3, "Минимум 3 символа"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: "", password: "" },
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      const { data } = await api.post("/users/login", null, { params: values });
      if (!data?.access_token) {
        throw new Error("access_token отсутствует в ответе");
      }

      const tokenUser = await decodeUserToken(data.access_token);
      if (!tokenUser.id) {
        console.warn("Токен не содержит id");
      }

      setUser({
        id: tokenUser.id ?? null,
        login: tokenUser.login ?? values.login,
      });
      setCookie("access_token", data.access_token, { maxAge: 60 * 60 });
      router.push("/dashboard");
    } catch (error) {
      console.error(
        "Login request failed: ",
        error instanceof Error ? error.message : String(error)
      );
    }
  };

  return (
    <AuthFormShell
      title="Войти"
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <p>
          Нет аккаунта?{" "}
          <Link
            href="/register"
            className="font-medium text-[#1a6bff] hover:underline"
          >
            Зарегистрироваться
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
        {isSubmitting ? "Загрузка..." : "Войти"}
      </button>
    </AuthFormShell>
  );
}
