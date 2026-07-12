import { useContext } from "react";
import { PortfolioContentContext } from "@/context/portfolioContentStore";

export const usePortfolioContent = () => {
  const context = useContext(PortfolioContentContext);
  if (!context) {
    throw new Error("usePortfolioContent must be used inside PortfolioContentProvider.");
  }
  return context;
};
