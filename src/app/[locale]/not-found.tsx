import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <section className="relative mx-auto flex min-h-[78vh] max-w-3xl flex-col items-center justify-center px-5 pt-28 text-center">
      <div className="grid-paper pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <LogoMark className="h-14 w-14" />
      <p className="eyebrow mt-8">Error 404 · Signal not found</p>
      <h1 className="h-section mt-4">This page drifted out of context.</h1>
      <p className="lead mt-5 max-w-xl">The address may have changed, or it never existed. Even reliable systems need a way back.</p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-dark">Return home</Link>
        <Link href="/research" className="btn btn-ghost">Read the research</Link>
      </div>
    </section>
  );
}
