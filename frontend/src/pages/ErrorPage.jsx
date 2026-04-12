import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import ShellLayout from "../components/ShellLayout";

export default function ErrorPage({ error = "An error occurred" }) {
  const navigate = useNavigate();

  return (
    <ShellLayout showNav={true}>
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-20 text-center">
        <div className="mb-6">
          <AlertTriangle size={64} className="mx-auto text-rose-400" />
        </div>

        <h1 className="text-4xl font-extrabold text-neutral-950 sm:text-5xl">
          Something Went Wrong
        </h1>

        <p className="mt-4 text-lg text-neutral-600">
          {error}
        </p>

        <p className="mt-2 text-sm text-neutral-500">
          Please try again or return to home.
        </p>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-amber-300 px-6 py-3 font-bold text-neutral-950 hover:scale-105 transition-transform"
          >
            Reload Page
          </button>
          <button
            onClick={() => navigate("/")}
            className="rounded-full bg-neutral-950 px-6 py-3 font-bold text-white hover:scale-105 transition-transform"
          >
            Return to Home
          </button>
        </div>
      </div>
    </ShellLayout>
  );
}
