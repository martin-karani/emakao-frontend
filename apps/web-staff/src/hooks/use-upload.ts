import { useMutation } from "@tanstack/react-query";
import type { DocumentType } from "@emakao/api-types";

export interface UploadResponse {
  key: string;
  url: string;
  content_type: string;
  size_bytes: number;
}

export type UploadContext =
  | "payment_proof"
  | "work_order"
  | "avatar"
  | "property_photo";

export function useUpload() {
  const upload = useMutation({
    mutationFn: async ({
      file,
      context,
      entityId,
    }: {
      file: File;
      context: UploadContext;
      entityId?: string;
    }): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", context);
      if (entityId) {
        formData.append("entity_id", entityId);
      }

      const res = await fetch("/api/proxy/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ message: "Upload failed" }));
        throw new Error(error.message || "Upload failed");
      }

      return res.json();
    },
  });

  const uploadDocument = useMutation({
    mutationFn: async ({
      file,
      documentType,
      propertyId,
    }: {
      file: File;
      documentType: DocumentType;
      propertyId?: string;
    }): Promise<{
      id: string;
      agency_id: string;
      file_name: string;
      mime_type: string;
      size_bytes: number;
      document_type: string;
      created_at: string;
      download_url: string;
      title?: string;
      notes?: string;
      property_id?: string;
      unit_id?: string;
      resident_id?: string;
      agreement_id?: string;
      work_order_id?: string;
    }> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", documentType);
      if (propertyId) {
        formData.append("property_id", propertyId);
      }

      const res = await fetch("/api/proxy/api/v1/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ message: "Document upload failed" }));
        throw new Error(error.message || "Document upload failed");
      }

      return res.json();
    },
  });

  return {
    upload,
    uploadDocument,
  };
}
