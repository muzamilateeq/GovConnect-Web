"use client";

import { motion } from "framer-motion";
import { ArrowRight, Landmark, Loader2, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "../theme-toggle";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("Supabase keys missing. Check .env.local or Vercel env.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f8fbf8] px-5 py-8 text-emerald-950 dark:bg-[#03140d] dark:text-white sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/20">
              <Landmark className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-lg font-semibold leading-5">
                GovConnect
              </span>
              <span className="text-xs font-medium text-emerald-900/55 dark:text-white/55">
                Secure access
              </span>
            </span>
          </Link>
          <ThemeToggle />
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_460px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/15 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-emerald-100">
              <LockKeyhole className="h-4 w-4" />
              Protected Government Portal
            </span>
            <h1 className="mt-7 max-w-3xl text-5xl font-semibold tracking-normal">
              Sign in to manage official listings and citizen services.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-900/65 dark:text-white/65">
              Access the admin command center, scraper logs, posting tools, and
              protected workflows through Supabase authentication.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            onSubmit={handleLogin}
            className="rounded-[2rem] border border-emerald-900/10 bg-white/80 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/10 sm:p-8"
          >
            <h2 className="text-3xl font-semibold">Login</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-900/60 dark:text-white/60">
              Use your Supabase Auth email and password.
            </p>

            <label className="mt-7 block text-sm font-semibold">
              Email address
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 dark:border-white/10 dark:bg-white/10">
                <Mail className="h-4 w-4 text-emerald-700 dark:text-emerald-200" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
                  placeholder="admin@example.com"
                />
              </div>
            </label>

            <label className="mt-5 block text-sm font-semibold">
              Password
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 dark:border-white/10 dark:bg-white/10">
                <LockKeyhole className="h-4 w-4 text-emerald-700 dark:text-emerald-200" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
                  placeholder="Enter password"
                />
              </div>
            </label>

            {message && (
              <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Sign in
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.form>
        </section>
      </div>
    </main>
  );
}
