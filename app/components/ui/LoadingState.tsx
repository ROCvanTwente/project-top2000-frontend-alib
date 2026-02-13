"use client";

type LoadingStateProps = {
  title?: string;
  subtitle?: string;
};

export default function LoadingState({
  title = "Gegevens worden geladen",
  subtitle = "Even geduld…",
}: LoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center px-6">
        {/* Spinner */} 
        <div className="relative mx-auto mb-8 w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-red-500/30"></div>
          <div className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
          {title}
        </h2>

        {/* Subtitle */}
        <p className="text-neutral-600 text-base md:text-lg">
          {subtitle}
        </p>

        {/* Subtle dots */}
        <div className="mt-4 flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></span>
          <span
            className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.15s" }}
          ></span>
          <span
            className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.3s" }}
          ></span>
        </div>
      </div>
    </div>
  );
}
