import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F8F8] px-4">
      <p className="text-6xl sm:text-8xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-xl sm:text-2xl font-semibold text-[#100F14]">
        Page not found
      </h1>
      <p className="mt-2 text-sm sm:text-base text-[#49475A] text-center max-w-md">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
      >
        Go to home
      </Link>
    </div>
  );
}
