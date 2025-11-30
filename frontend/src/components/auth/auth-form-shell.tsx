import type { FormEventHandler, ReactNode } from "react";

type AlignOption = "left" | "center";

const alignMap: Record<AlignOption, string> = {
  left: "text-left",
  center: "text-center",
};

export type AuthFormShellProps = {
  title: string;
  subtitle?: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  footer?: ReactNode;
  headingAlign?: AlignOption;
  footerAlign?: AlignOption;
};

export function AuthFormShell({
  title,
  subtitle,
  onSubmit,
  children,
  footer,
  headingAlign = "center",
  footerAlign,
}: AuthFormShellProps) {
  const headingClass = alignMap[headingAlign];
  const footerClass = alignMap[footerAlign ?? headingAlign];

  return (
    <main>
      <div className={`mb-8 ${headingClass}`}>
        <h1 className="text-3xl font-semibold text-black">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-[#8a8ea3]">{subtitle}</p>}
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        {children}
      </form>
      {footer && (
        <div className={`mt-6 text-sm text-[#8a8ea3] ${footerClass}`}>
          {footer}
        </div>
      )}
    </main>
  );
}
