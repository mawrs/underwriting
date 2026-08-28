"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { calculate } from "./calculations";
import { seedApplications } from "./mock-data";
import type {
  Application,
  ApplicationPatch,
  Decision,
  Role,
} from "./types";

const STORAGE_KEY = "uw-prototype-v1";
const SERVER_SNAPSHOT = seedApplications;

type Listener = () => void;

const listeners = new Set<Listener>();
let state: Application[] = seedApplications;
let clientHydrated = false;

function clone<T>(value: T): T {
  return structuredClone(value);
}

function emit() {
  listeners.forEach((listener) => listener());
}

function persist(next: Application[]) {
  state = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  emit();
}

function loadApplications(): Application[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(seedApplications);
    const parsed = JSON.parse(raw) as Application[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return clone(seedApplications);
    }
    return parsed;
  } catch {
    return clone(seedApplications);
  }
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (!clientHydrated) {
    state = loadApplications();
    clientHydrated = true;
  }
  return state;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

interface StoreValue {
  ready: boolean;
  role: Role;
  setRole: (role: Role) => void;
  applications: Application[];
  getApplication: (id: string) => Application | undefined;
  updateApplication: (id: string, patch: ApplicationPatch) => void;
  submitToSenior: (id: string) => boolean;
  completeSeniorReview: (id: string, decision: Decision) => boolean;
  resetStore: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const applications = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [role, setRole] = useState<Role>("underwriter");

  const getApplication = useCallback(
    (id: string) => applications.find((item) => item.id === id),
    [applications],
  );

  const updateApplication = useCallback((id: string, patch: ApplicationPatch) => {
    state = state.map((item) => {
      if (item.id !== id) return item;
      return {
        ...item,
        ...patch,
        borrower: patch.borrower ?? item.borrower,
        income: patch.income ?? item.income,
        documents: patch.documents ?? item.documents,
        liabilities: patch.liabilities ?? item.liabilities,
        debtTrades: patch.debtTrades ?? item.debtTrades,
        notes: patch.notes ?? item.notes,
        lastSavedAt: new Date().toISOString(),
      };
    });
    persist(state);
  }, []);

  const submitToSenior = useCallback((id: string) => {
    const current = state.find((item) => item.id === id);
    if (!current) return false;
    const now = new Date().toISOString();
    const snapshot = {
      submittedAt: now,
      submittedBy: current.underwriter,
      documents: clone(current.documents),
      liabilities: clone(current.liabilities),
      income: clone(current.income),
      debtTrades: clone(current.debtTrades),
      notes: clone(current.notes),
      decision: current.decision,
      calculations: calculate(current),
    };
    persist(
      state.map((item) => {
        if (item.id !== id) return item;
        if (item.decision === "needs-docs") {
          return {
            ...item,
            status: "needs-docs" as const,
            lastSavedAt: now,
            primarySnapshot: snapshot,
          };
        }
        return {
          ...item,
          status: "senior-review" as const,
          submittedAt: now,
          lastSavedAt: now,
          primarySnapshot: snapshot,
        };
      }),
    );
    return true;
  }, []);

  const completeSeniorReview = useCallback((id: string, decision: Decision) => {
    if (decision !== "approve" && decision !== "return-to-uw") return false;
    persist(
      state.map((item) => {
        if (item.id !== id) return item;
        const now = new Date().toISOString();
        if (decision === "approve") {
          return {
            ...item,
            status: "approved",
            seniorDecision: decision,
            approvedAt: now,
            lastSavedAt: now,
          };
        }
        return {
          ...item,
          status: "returned",
          seniorDecision: decision,
          returnedAt: now,
          lastSavedAt: now,
        };
      }),
    );
    return true;
  }, []);

  const resetStore = useCallback(() => {
    clientHydrated = true;
    persist(clone(seedApplications));
  }, []);

  const value = useMemo(
    () => ({
      ready: true,
      role,
      setRole,
      applications,
      getApplication,
      updateApplication,
      submitToSenior,
      completeSeniorReview,
      resetStore,
    }),
    [
      role,
      applications,
      getApplication,
      updateApplication,
      submitToSenior,
      completeSeniorReview,
      resetStore,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used within StoreProvider");
  return value;
}

export function useApplication(id: string) {
  const { getApplication, updateApplication, ready } = useStore();
  const application = getApplication(id);
  return { application, updateApplication, ready };
}
