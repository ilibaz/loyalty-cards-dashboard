"use client";

import { Benefit } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";

type BenefitWithUsed = Benefit & {
  used: boolean;
  description?: string;
};

interface BenefitsListProps {
  benefits: BenefitWithUsed[];
  actionBenefitId: number | null;
  onUseBenefit: (benefitId: number) => void;
}

interface InputFormProps {
  userId: string;
  setUserId: (id: string) => void;
  venueId: string;
  setVenueId: (id: string) => void;
  fetchBenefits: () => void;
  areInputsValid: boolean;
  isLoading: boolean;
  error: string | null;
}

export default function Page() {
  const [userId, setUserId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [benefits, setBenefits] = useState<BenefitWithUsed[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionBenefitId, setActionBenefitId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const areInputsValid =
    userId.trim() !== "" &&
    venueId.trim() !== "" &&
    !isNaN(parseInt(userId)) &&
    !isNaN(parseInt(venueId));

  // reset benetits, errors, fetch flag if inputs are cleared or become invalid
  useEffect(() => {
    if (!areInputsValid && (userId.trim() === "" || venueId.trim() === "")) {
      setBenefits([]);
      setError(null);
      setHasAttemptedFetch(false);
    }
  }, [userId, venueId, areInputsValid]);

  const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Request failed: ${response.statusText || response.status}`,
      }));
      throw new Error(
        errorData.error || `HTTP error! Status: ${response.status}`
      );
    }
    return response.json();
  };

  const fetchBenefits = useCallback(async () => {
    if (!areInputsValid) {
      setError("Please enter valid numeric User ID and Venue ID.");
      setBenefits([]);
      setHasAttemptedFetch(false); // explicitly set if inputs invalid for current attempt
      return;
    }
    setIsLoading(true);
    setError(null);
    setBenefits([]); // clear previous benefits before new fetch

    try {
      const response = await fetch(
        `/api/benefits/${userId.trim()}/${venueId.trim()}`
      );
      const data = await handleApiResponse(response);
      setBenefits(Array.isArray(data.benefits) ? data.benefits : []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while fetching benefits.");
      }
      setBenefits([]); // ensure benefits are empty on error
    } finally {
      setIsLoading(false);
      setHasAttemptedFetch(true); // mark that a fetch attempt has been completed
    }
  }, [userId, venueId, areInputsValid]);

  const onUseBenefit = async (benefitId: number) => {
    if (!areInputsValid) {
      setError("User ID and Venue ID must be valid to use a benefit.");
      return;
    }
    setActionBenefitId(benefitId);
    setError(null);

    try {
      const response = await fetch("/api/benefits/use", {
        method: "POST",
        body: JSON.stringify({
          userId: Number(userId.trim()),
          benefitId: Number(benefitId),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await handleApiResponse(response);
      setBenefits(Array.isArray(data.benefits) ? data.benefits : []);
      // after using a benefit we've re-fetched already so keep hasAttemptedFetch as true
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while using the benefit.");
      }
    } finally {
      setActionBenefitId(null);
    }
  };

  return (
    <main className="p-4 sm:p-6 md:p-8 bg-slate-100 min-h-screen selection:bg-indigo-100 selection:text-indigo-700">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center pt-4 pb-2">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Loyalty Benefits Portal
          </h1>
        </header>

        <InputForm
          userId={userId}
          setUserId={setUserId}
          venueId={venueId}
          setVenueId={setVenueId}
          fetchBenefits={fetchBenefits}
          areInputsValid={areInputsValid}
          isLoading={isLoading}
          error={error}
        />

        <BenefitsList
          benefits={benefits}
          actionBenefitId={actionBenefitId}
          onUseBenefit={onUseBenefit}
        />

        {!isLoading &&
          benefits.length === 0 &&
          areInputsValid &&
          !error &&
          hasAttemptedFetch && <NoBenefitsFoundHelp />}

        {!isLoading && !areInputsValid && !hasAttemptedFetch && (
          <EnterIdsToViewBenefitsHelp />
        )}
      </div>
    </main>
  );
}

const InputForm = ({
  userId,
  setUserId,
  venueId,
  setVenueId,
  fetchBenefits,
  areInputsValid,
  isLoading,
  error,
}: InputFormProps) => {
  return (
    <section className="bg-white p-6 sm:p-8 rounded-xl shadow-xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-end">
        <div>
          <label
            htmlFor="userId"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            User ID
          </label>
          <input
            id="userId"
            type="number"
            placeholder="e.g., 1"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="text-slate-900 placeholder:text-slate-400 border border-slate-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-150 ease-in-out shadow-sm hover:border-slate-400"
            aria-label="User ID"
          />
        </div>
        <div>
          <label
            htmlFor="venueId"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Venue ID
          </label>
          <input
            id="venueId"
            type="number"
            placeholder="e.g., 1"
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            className="text-slate-900 placeholder:text-slate-400 border border-slate-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-150 ease-in-out shadow-sm hover:border-slate-400"
            aria-label="Venue ID"
          />
        </div>
        <button
          onClick={fetchBenefits}
          disabled={!areInputsValid || isLoading}
          className={`w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold
                  hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-150 ease-in-out transform active:scale-[0.98] shadow hover:shadow-md`}
        >
          {isLoading ? "Loading..." : "Load Benefits"}
        </button>
      </div>
      {error && (
        <div
          role="alert"
          className="text-sm text-red-700 bg-red-100 border border-red-300 p-3 rounded-lg shadow-sm"
        >
          <span className="font-medium">Error:</span> {error}
        </div>
      )}
    </section>
  );
};

const BenefitsList = ({
  actionBenefitId,
  benefits,
  onUseBenefit,
}: BenefitsListProps) => {
  if (benefits.length === 0) {
    return null;
  }

  return (
    <section className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Available Benefits
      </h2>
      <ul className="space-y-4">
        {benefits.map((b) => (
          <li
            key={b.id}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center border border-slate-200 p-4 rounded-lg transition-all duration-150 ease-in-out hover:shadow-lg hover:border-indigo-300 bg-slate-50/50"
          >
            <div className="mb-3 sm:mb-0 flex-grow">
              <p className="font-semibold text-lg text-slate-800">
                {b.description || b.name}
              </p>
              <p
                className={`text-sm font-medium tracking-wide ${
                  b.used ? "text-red-600" : "text-emerald-600"
                }`}
              >
                <span className="font-normal text-slate-500">Status: </span>{" "}
                {b.used ? "USED" : "AVAILABLE"}
              </p>
            </div>
            <button
              disabled={b.used || actionBenefitId === b.id}
              onClick={() => onUseBenefit(b.id)}
              className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-150 ease-in-out transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 shadow hover:shadow-md
                      ${
                        b.used
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                          : actionBenefitId === b.id
                          ? "bg-amber-500 text-white cursor-wait focus:ring-amber-400"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500"
                      } w-full sm:w-auto sm:min-w-[120px] text-center`}
            >
              {actionBenefitId === b.id
                ? "Processing..."
                : b.used
                ? "Claimed"
                : "Use Benefit"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

const NoBenefitsFoundHelp = () => {
  return (
    <section className="bg-white p-8 rounded-xl shadow-xl text-center">
      <h3 className="mt-2 text-lg font-medium text-slate-800">
        No Benefits Found
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        No benefits are currently listed for this User/Venue combination.
      </p>
    </section>
  );
};

const EnterIdsToViewBenefitsHelp = () => {
  return (
    <section className="bg-white p-8 rounded-xl shadow-xl text-center">
      <h3 className="mt-2 text-lg font-medium text-slate-800">
        Enter IDs to View Benefits
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Please provide a User ID and Venue ID to load loyalty benefits.
      </p>
    </section>
  );
};
