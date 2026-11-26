"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="glass mt-8 space-y-4 !rounded-[1.5rem] p-6">
      <label htmlFor="password" className="block text-sm font-medium">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required className="block w-full rounded-xl bg-white px-4 py-3 shadow-[inset_0_0_0_1px_var(--color-line-strong)] focus:shadow-[inset_0_0_0_2px_var(--color-jade-deep)] focus:outline-none" />
      {state?.error && <p className="text-sm font-medium text-coral" role="alert">{state.error}</p>}
      <button disabled={pending} className="btn btn-dark w-full">{pending ? "Verifying…" : "Sign in"}</button>
    </form>
  );
}
