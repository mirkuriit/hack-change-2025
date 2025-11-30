// import Image from "next/image";

import Link from "next/link";

// Общий лэйаут для страниц аутентификации (логин, регистрация)
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <Link
        href="/"
        className="absolute right-6 top-6 text-sm font-medium text-[#8a8ea3] transition hover:text-[#1a6bff]"
      >
        Вернуться назад
      </Link>

      {/* <div className="pointer-events-none absolute inset-0 items-center justify-center hidden lg:flex">
        <div className="relative h-full max-h-[960px]">
          <Image
            src="/icons/desktop_background.svg"
            alt="Задний фон"
            width={1024}
            height={1024}
            priority
            className="h-full w-full"
          />
        </div>
      </div> */}

      <div className="relative z-10 w-full max-w-md p-10 text-center">
        {children}
      </div>
    </div>
  );
}
