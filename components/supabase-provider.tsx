"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createSupabaseStorage,
  migrateLocalStorageToSupabase,
  type ListeningStorage,
} from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import {
  getErrorMessage,
  getSupabaseSetupHint,
  isJwtClockSkewError,
} from "@/lib/supabase/errors";

interface SupabaseContextValue {
  storage: ListeningStorage;
  user: User | null;
  isReady: boolean;
  error: string | null;
}

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

interface SupabaseProviderProps {
  children: ReactNode;
}

async function signInAnonymously(
  client: SupabaseClient,
): Promise<User> {
  const { data, error } = await client.auth.signInAnonymously();

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Could not establish an anonymous session");
  }

  return data.user;
}

/** Clear a bad/skewed JWT and mint a fresh anonymous session. */
async function recoverSession(client: SupabaseClient): Promise<User> {
  await client.auth.signOut({ scope: "local" });
  return signInAnonymously(client);
}

/**
 * Prefer an existing session; if PostgREST rejects the JWT (clock skew),
 * discard it and sign in again.
 */
async function establishUser(client: SupabaseClient): Promise<User> {
  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession();

  if (sessionError) {
    console.error("Supabase getSession failed:", sessionError);
    return recoverSession(client);
  }

  if (!session?.user) {
    return signInAnonymously(client);
  }

  // Probe that the access token is accepted by PostgREST (not just Auth).
  const { error: probeError } = await client
    .from("listening_sessions")
    .select("id", { count: "exact", head: true })
    .limit(1);

  if (!probeError) {
    return session.user;
  }

  if (isJwtClockSkewError(probeError)) {
    console.warn(
      "Supabase JWT rejected (clock skew or stale token). Re-authenticating…",
      probeError,
    );
    return recoverSession(client);
  }

  // Other probe errors (missing table, RLS) still mean auth worked —
  // let migration / pages surface them.
  if (
    getErrorMessage(probeError).toLowerCase().includes("jwt") ||
    getErrorMessage(probeError).toLowerCase().includes("unauthorized")
  ) {
    return recoverSession(client);
  }

  return session.user;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [{ client: supabase, initError }] = useState(() => {
    try {
      return { client: createClient(), initError: null as string | null };
    } catch (error) {
      return { client: null, initError: getErrorMessage(error) };
    }
  });
  const storage = useMemo(
    () => (supabase ? createSupabaseStorage(supabase) : null),
    [supabase],
  );
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !storage) {
      return;
    }

    const client = supabase;
    let cancelled = false;

    async function bootstrap() {
      try {
        let activeUser = await establishUser(client);

        try {
          await migrateLocalStorageToSupabase(client, activeUser.id);
        } catch (migrationError) {
          if (isJwtClockSkewError(migrationError)) {
            activeUser = await recoverSession(client);
            await migrateLocalStorageToSupabase(client, activeUser.id);
          } else {
            throw migrationError;
          }
        }

        if (!cancelled) {
          setUser(activeUser);
          setIsReady(true);
        }
      } catch (bootstrapError) {
        console.error("Supabase bootstrap failed:", bootstrapError);

        if (!cancelled) {
          setError(getErrorMessage(bootstrapError));
        }
      }
    }

    void bootstrap();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [storage, supabase]);

  const value = useMemo(
    () => ({
      storage: storage!,
      user,
      isReady,
      error,
    }),
    [storage, user, isReady, error],
  );

  const displayError = initError ?? error;

  if (displayError) {
    const hint = getSupabaseSetupHint(displayError);

    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 p-6">
        <p className="max-w-md text-center text-sm text-destructive">
          {displayError}
        </p>
        {hint ? (
          <p className="max-w-md text-center text-sm text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }

  if (!supabase || !storage || !isReady) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Loading your library…</p>
      </div>
    );
  }

  return (
    <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);

  if (!context) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }

  return context;
}
