import Link from "next/link";

export default function Footer() {
  return (
    <div className="p-2 border-t text-sm bg-slate-100 flex gap-2 justify-center">
      <p>⚡Supabase Next JS Auth Boilerplate</p>
      <p>&#8226;</p>
      <Link
        href="https://daveyreno.com"
        className="font-medium underline hover:no-underline"
      >
        DaveyReno.com
      </Link>
    </div>
  );
}
