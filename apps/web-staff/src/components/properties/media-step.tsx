import { useFormContext } from "react-hook-form";
import {
  ImagePlus,
  FileText,
  Loader2,
  Plus,
  X,
  ArrowRight,
} from "lucide-react";
import { StepHeader } from "./step-header";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUpload } from "@/hooks/use-upload";
import type { PropertyFormValues } from "@/lib/schemas/property";

interface MediaStepProps {
  onNext: () => void;
  onBack: () => void;
  keyToUrl: Record<string, string>;
  setKeyToUrl: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function MediaStep({
  onNext,
  onBack,
  keyToUrl,
  setKeyToUrl,
}: MediaStepProps) {
  const { watch, setValue } = useFormContext<PropertyFormValues>();
  const photos = watch("photos");
  const documents = watch("documents");
  const { upload, uploadDocument } = useUpload();

  return (
    <div className="space-y-6">
      <StepHeader
        icon={ImagePlus}
        title="Media"
        description="Upload visual assets and documentation."
      />

      <div className="grid gap-6">
        <div className="rounded-2xl border bg-background p-6">
          <Label className="mb-4 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Photos
          </Label>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {photos.map((url, i) => (
              <div
                key={`${url}-${i}`}
                className="group relative aspect-square overflow-hidden rounded-xl border bg-muted"
              >
                <img
                  src={keyToUrl[url] || url}
                  alt="Property"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "photos",
                      photos.filter((_, idx) => idx !== i),
                    )
                  }
                  className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            <label className="flex cursor-pointer flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 transition-all hover:border-primary/40 hover:bg-primary/5">
              <ImagePlus className="size-6 text-muted-foreground" />
              <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Add Photo
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                disabled={upload.isPending}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const res = await upload.mutateAsync({
                        file,
                        context: "property_photo",
                      });
                      setKeyToUrl((prev) => ({
                        ...prev,
                        [res.key]: res.url,
                      }));
                      setValue("photos", [...photos, res.key]);
                    } catch (err) {
                      console.error("Upload failed", err);
                    }
                  }
                }}
              />
              {upload.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl">
                  <Loader2 className="size-4 animate-spin text-primary" />
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="rounded-2xl border bg-background p-6">
          <Label className="mb-4 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Documents
          </Label>
          <div className="space-y-2">
            {documents.map((doc, i) => (
              <div
                key={`${doc.url}-${i}`}
                className="flex items-center justify-between rounded-xl border bg-muted/20 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-background">
                    <FileText className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      {doc.document_type}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "documents",
                      documents.filter((_, idx) => idx !== i),
                    )
                  }
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl border-dashed py-6 text-xs uppercase tracking-widest"
                disabled={uploadDocument.isPending}
                onClick={() => {
                  const input = document.getElementById(
                    "doc-upload",
                  ) as HTMLInputElement;
                  input?.click();
                }}
              >
                {uploadDocument.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 size-4" />
                )}
                Attach File
              </Button>
              <input
                id="doc-upload"
                type="file"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const res = await uploadDocument.mutateAsync({
                        file,
                        documentType: "Agreement", // Default
                      });
                      setKeyToUrl((prev) => ({
                        ...prev,
                        [res.s3_key]: res.url,
                      }));
                      setValue("documents", [
                        ...documents,
                        {
                          name: file.name,
                          url: res.s3_key,
                          document_type: "Agreement",
                        },
                      ]);
                    } catch (err) {
                      console.error("Document upload failed", err);
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={onNext}
          disabled={upload.isPending || uploadDocument.isPending}
          className="rounded-xl px-8 shadow-lg shadow-primary/20"
        >
          Next: Team
          {upload.isPending || uploadDocument.isPending ? (
            <Loader2 className="ml-2 size-4 animate-spin" />
          ) : (
            <ArrowRight className="ml-2 size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
