import { useCallback, useEffect, useState } from "react";
import fallbackContent from "@/data/portfolio.json";
import { getPortfolioContent, savePortfolioContent } from "@/services/portfolioContent";
import { PortfolioContentContext } from "@/context/portfolioContentStore";

export const PortfolioContentProvider = ({ children }) => {
  const [content, setContent] = useState(fallbackContent);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const refreshContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const remoteContent = await getPortfolioContent();
      if (remoteContent) setContent(remoteContent);
      setLoadError(null);
    } catch (error) {
      console.error("Could not load portfolio content from Supabase:", error);
      setLoadError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  const saveContent = useCallback(async (nextContent, ownerId) => {
    const savedContent = await savePortfolioContent(nextContent, ownerId);
    setContent(savedContent);
    return savedContent;
  }, []);

  return (
    <PortfolioContentContext.Provider
      value={{ content, isLoading, loadError, refreshContent, saveContent }}
    >
      {children}
    </PortfolioContentContext.Provider>
  );
};
