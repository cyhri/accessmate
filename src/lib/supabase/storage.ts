import { supabase } from "./client";

export type StorageBucket =
  | "building-evidence"
  | "community-reports"
  | "venue-images"
  | "avatars";

export interface UploadResult {
  path: string;
  publicUrl: string;
}

export const storageService = {
  /**
   * Upload a file to a designated Supabase storage bucket.
   */
  async uploadFile(
    bucket: StorageBucket,
    filePath: string,
    file: File | Blob
  ): Promise<UploadResult> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  },

  /**
   * Get public URL for an asset.
   */
  getPublicUrl(bucket: StorageBucket, filePath: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Remove a file from storage.
   */
  async deleteFile(bucket: StorageBucket, filePath: string): Promise<boolean> {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;
    return true;
  },
};
