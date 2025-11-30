import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  // TODO: move to auth layout
  const token = (await cookies()).get("access_token")?.value;

  if (token) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-14 px-6 py-6 lg:py-12 lg:flex-row lg:gap-24">
        <div className="flex max-w-fit flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="mt-10 text-4xl font-bold sm:text-5xl">
            Анализируйте отзывы в пару кликов
          </h1>
          <p className="mt-5 w-full max-w-sm text-lg text-[#6b7280] mx-auto lg:mx-0">
            Импортируйте CSV-файлы, отслеживайте тональность сообщений и
            мгновенно делитесь результатами с командой
          </p>
          <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
            <Link
              href="/login"
              className="rounded-2xl bg-[#1C6BE8] py-3 text-center text-lg font-semibold text-white shadow transition hover:bg-[#1557d1]"
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="rounded-2xl bg-[#1C6BE8] py-3 text-center text-lg font-semibold text-white shadow transition hover:bg-[#1557d1]"
            >
              Зарегистрироваться
            </Link>
            <Link
              href="/demo"
              className="rounded-2xl border border-[#dbe5fb] bg-white py-3 text-center text-lg font-semibold text-[#1C6BE8] transition hover:border-[#1C6BE8]"
            >
              Попробовать демо
            </Link>
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="relative w-full max-w-md">
            <Image
              src="/icons/icon.svg"
              alt="Интерфейс приложения"
              width={600}
              height={600}
              className="h-full w-full"
              priority
            />
          </div>
        </div>
      </div>
    </main>
  );
}
