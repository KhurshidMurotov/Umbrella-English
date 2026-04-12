import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import ShellLayout from "../components/ShellLayout";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <ShellLayout showNav={true}>
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-20 text-center">
        <div className="mb-6">
          <AlertTriangle size={64} className="mx-auto text-amber-400" />
        </div>

        <h1 className="text-4xl font-extrabold text-neutral-950 sm:text-5xl">
          404: Page Not Found
        </h1>

        <p className="mt-4 text-lg text-neutral-600">
          Sorry, we couldn't find the page you're looking for.
        </p>

        <p className="mt-2 text-sm text-neutral-500">
          The page may have moved or doesn't exist.
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-8 rounded-full bg-neutral-950 px-6 py-3 font-bold text-white hover:scale-105 transition-transform"
        >
          Return to Home
        </button>
      </div>
    </ShellLayout>
  );
}
