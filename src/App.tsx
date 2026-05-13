import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CollectionsProvider } from "./context/CollectionsContext";
import { CommandsProvider } from "./context/CommandsContext";
import { HistoryProvider } from "./context/HistoryContext";
import { SettingsProvider } from "./context/SettingsContext";
import { BottomNav } from "./components/BottomNav";
import { HomePage } from "./pages/HomePage";
import { PlatformPage } from "./pages/PlatformPage";
import { SearchPage } from "./pages/SearchPage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PrivacyPage } from "./pages/PrivacyPage";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col text-[17.5px] leading-relaxed">
      {children}
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <CommandsProvider>
          <CollectionsProvider>
            <HistoryProvider>
              <Shell>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/platform/:id" element={<PlatformPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/collections" element={<CollectionsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Shell>
            </HistoryProvider>
          </CollectionsProvider>
        </CommandsProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
