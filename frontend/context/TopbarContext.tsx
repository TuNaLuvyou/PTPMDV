"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TopbarContextType {
  headerActions: ReactNode | null;
  setHeaderActions: (actions: ReactNode | null) => void;
}

const TopbarContext = createContext<TopbarContextType>({
  headerActions: null,
  setHeaderActions: () => {},
});

export function TopbarProvider({ children }: { children: ReactNode }) {
  const [headerActions, setHeaderActions] = useState<ReactNode | null>(null);

  return (
    <TopbarContext.Provider value={{ headerActions, setHeaderActions }}>
      {children}
    </TopbarContext.Provider>
  );
}

export function useTopbar() {
  return useContext(TopbarContext);
}
