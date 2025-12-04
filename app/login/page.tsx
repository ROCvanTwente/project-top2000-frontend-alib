"use client";

import React, { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { formatApiErrors } from "../../lib/api";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      await login(email, password);
    } catch (err: any) {
      if (err && err.errors) {
        setFieldErrors(err.errors);
        // Only set a top-level error if there are general (un-keyed) errors.
        const general = err.errors._global ?? err.errors[""] ?? null;
        if (Array.isArray(general) && general.length) {
          setError(String(general[0]));
        } else if (err && err.message) {
          // fallback to message only when no field-specific errors
          setError(err.message);
        } else {
          setError(null);
        }
      } else if (err && err.message) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
      setLoading(false);
    }
  };
  const generalErrors = fieldErrors[""] ?? fieldErrors._global ?? [];

  return (
    <main className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 bg-muted">
      <div className="w-full max-w-md bg-card rounded-lg shadow p-8">
        <h2 className="text-2xl font-semibold mb-4">Sign in</h2>

        {generalErrors && generalErrors.length > 0 ? (
          <div className="mb-4">
            <div className="text-sm text-destructive">{generalErrors[0]}</div>
          </div>
        ) : (
          error && <div className="mb-4 text-sm text-destructive">{error}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
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
            <label className="block text-sm mb-1">Password</label>
            <input
              className="w-full px-3 py-2 border rounded"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {fieldErrors.Password && <div className="text-sm text-destructive mt-1">{fieldErrors.Password[0]}</div>}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <Link href="/register" className="text-sm text-muted-foreground">Create account</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
