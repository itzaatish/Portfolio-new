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

const DEFAULT_IMAGE_PATH = "/public/default.jpg";
const BUCKET_NAME = "portfolio_image_bucket";

export const uploadImage = async (file, oldImageUrl) => {
  // 1. Handle Deletion of the Old Image
  if (oldImageUrl && !oldImageUrl.includes(DEFAULT_IMAGE_PATH)) {
    try {
      const urlParts = oldImageUrl.split(`${BUCKET_NAME}/`);
      if (urlParts.length > 1) {
        const pathToDelete = decodeURIComponent(urlParts[1]);
        console.log(`Attempting to delete old image: ${pathToDelete}`);
        const { error: deleteError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([pathToDelete]);
        if (deleteError) {
          // Log the error but don't block the upload
          console.warn(`Could not delete old image: ${deleteError.message}`);
        }
      }
    } catch (error) {
      console.warn(`Error processing old image URL for deletion: ${error.message}`);
    }
  }

  // 2. Upload the New Image
  if (!file) {
    // If no new file is provided, return the old URL without changes
    return oldImageUrl;
  }

  const fileExtension = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExtension}`;
  const filePath = `private/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(`Storage upload error: ${uploadError.message}`);
  }

  // 3. Get the Public URL of the New Image
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    throw new Error("Could not get public URL for the uploaded image.");
  }

  return data.publicUrl;
};

