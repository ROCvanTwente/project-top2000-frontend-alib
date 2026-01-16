"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  message?: string;
  error?: string | null;

  // voor je contactpagina (query params)
  contactPath?: string;
  issue?: string;
};

export default function ErrorState({
  title = "Oeps… er ging iets mis",
  message = "Er ging iets mis. Probeer het later opnieuw.",
  error,
  contactPath = "/contact",
  issue = "unknown-error",
}: ErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-sm border border-red-100 p-6 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>

        <h2 className="text-xl md:text-2xl font-black tracking-tight mb-2">
          {title}
        </h2>

        <p className="text-neutral-600 mb-4">
          {message}
          <br />
          <span className="text-sm text-neutral-500">
            Blijft dit probleem zich herhalen? Neem dan{" "}
            <Link
              href={{
                pathname: contactPath,
                query: {
                  issue,
                  details: error ?? "",
                },
              }}
              className="text-red-600 hover:text-red-700 font-semibold underline underline-offset-2"
            >
              contact met ons op
            </Link>{" "}
            en vermeld de foutmelding, zodat we je sneller kunnen helpen.
          </span>
        </p>

        {!!error && (
          <div className="text-left bg-neutral-50 rounded-lg p-3 border border-neutral-200 mb-5">
            <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
              Foutmelding
            </p>
            <p className="text-sm text-neutral-700 break-words">{error}</p>
          </div>
        )}

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-sm bg-white border border-gray-200 text-gray-700 hover:shadow-md transition"
        >
          <RefreshCw className="h-4 w-4" />
          Pagina vernieuwen
        </button>
      </div>
    </div>
  );
}
