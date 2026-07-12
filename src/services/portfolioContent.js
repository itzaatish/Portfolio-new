import { supabase } from "@/utils/superbase";

const TABLE = "portfolio_content";
const CONTENT_ID = "main";

export const getPortfolioContent = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("content")
    .eq("id", CONTENT_ID)
    .maybeSingle();

  if (error) throw error;
  return data?.content ?? null;
};

export const savePortfolioContent = async (content, ownerId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { id: CONTENT_ID, content, owner_id: ownerId },
      { onConflict: "id" }
    )
    .select("content")
    .single();

  if (error) throw error;
  return data.content;
};
