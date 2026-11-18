import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  image?: string;
  children: ReactNode;
};

export default function AuthShell({
  title,
  subtitle,
  image = "/images/HeroSlide1.png",
  children,
}: Props) {
  return (
    // pt-* clears the fixed navbar. Match it to your navbar height.
    <main className="px-4 pb-10 pt-28 sm:px-6 sm:pt-32 lg:pt-36">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2">
        {/* Image: banner on small screens, full-height column on lg+ */}
        <aside className="relative h-44 sm:h-60 lg:h-auto lg:min-h-[560px]">
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
        </aside>

        {/* Form: sets the card height on large screens */}
        <section className="flex items-center justify-center px-5 py-8 sm:px-10 sm:py-10">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
            <div className="mt-6 sm:mt-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}