import { Routes, Route, Navigate } from "react-router";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";

// Lazy load pages for better performance
const DecksPage = lazy(() => import("./pages/DecksPage"));
const DeckDetailsPage = lazy(() => import("./pages/DeckDetailsPage"));
const StudyPage = lazy(() => import("./pages/StudyPage"));

// Loading component for Suspense fallback
const Loading = () => <div className="loading">Loading...</div>;

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DecksPage />} />
          <Route path="decks/:deckId" element={<DeckDetailsPage />} />
          <Route path="study" element={<StudyPage />} />
          <Route path="study/:deckId" element={<StudyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
