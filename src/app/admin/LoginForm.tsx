"use client";

import { useActionState } from "react";
import { login } from "./actions";

const input = "block w-full rounded-xl bg-white px-4 py-3 shadow-[inset_0_0_0_1px_var(--color-line-strong)] focus:shadow-[inset_0_0_0_2px_var(--color-jade-deep)] focus:outline-none";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="glass mt-8 space-y-4 !rounded-[1.5rem] p-6">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className={input} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
      </div>
      {state?.error && <p className="text-sm font-medium text-coral" role="alert">{state.error}</p>}
      <button disabled={pending} className="btn btn-dark w-full">{pending ? "Verifying…" : "Sign in with Supabase"}</button>
    </form>
  );
}
