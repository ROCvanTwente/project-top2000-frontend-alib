"use client";

import React, { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { formatApiErrors } from "../../lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      await register(email, password, confirm);
    } catch (err: any) {
      // First, always extract and set field errors if they exist
      if (err?.errors && typeof err.errors === "object") {
        setFieldErrors(err.errors);
        const globalErrors = err.errors._global || err.errors[""];
        if (globalErrors && Array.isArray(globalErrors) && globalErrors.length > 0) {
          setError(globalErrors.join(" "));
        } else {
          setError(err.message || "Registration failed");
        }
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
      setLoading(false);
    }
  };
  const generalErrors = fieldErrors[""] ?? fieldErrors._global ?? [];

  return (
    <main className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 bg-muted">
      <div className="w-full max-w-md bg-card rounded-lg shadow p-8">
        <h2 className="text-2xl font-semibold mb-4">Account maken</h2>

        {generalErrors && generalErrors.length > 0 && (
          <div className="mb-4 space-y-1">
            {generalErrors.map((err, idx) => (
              <div key={idx} className="text-sm text-destructive">
                {err}
              </div>
            ))}
          </div>
        )}
        {!generalErrors.length && error && (
          <div className="mb-4 text-sm text-destructive">{error}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">E-mail</label>
            <input
              className="w-full px-3 py-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
            {fieldErrors.Email && <div className="text-sm text-destructive mt-1">{fieldErrors.Email[0]}</div>}
          </div>

          <div>
            <label className="block text-sm mb-1">Wachtwoord</label>
            <input
              className="w-full px-3 py-2 border rounded"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {fieldErrors.Password && <div className="text-sm text-destructive mt-1">{fieldErrors.Password[0]}</div>}
          </div>

          <div>
            <label className="block text-sm mb-1">Bevestig wachtwoord</label>
            <input
              className="w-full px-3 py-2 border rounded"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {fieldErrors.ConfirmPassword && <div className="text-sm text-destructive mt-1">{fieldErrors.ConfirmPassword[0]}</div>}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-60"
            >
              {loading ? "Bezig met maken..." : "Account maken"}
            </button>

            <Link href="/login" className="text-sm text-muted-foreground">Al een account?</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
