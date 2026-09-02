"use client";

import type { User } from "@supabase/supabase-js";
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
import { getErrorMessage, getSupabaseSetupHint } from "@/lib/supabase/errors";

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
        const {
          data: { session },
          error: sessionError,
        } = await client.auth.getSession();

        if (sessionError) {
          console.error("Supabase getSession failed:", sessionError);
          await client.auth.signOut();
        }

        let activeUser = sessionError ? null : (session?.user ?? null);

        if (!activeUser) {
          const { data, error: signInError } =
            await client.auth.signInAnonymously();

          if (signInError) {
            console.error("Supabase anonymous sign-in failed:", signInError);
            throw signInError;
          }

          activeUser = data.user;
        }

        if (!activeUser) {
          throw new Error("Could not establish an anonymous session");
        }

        await migrateLocalStorageToSupabase(client, activeUser.id);

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
