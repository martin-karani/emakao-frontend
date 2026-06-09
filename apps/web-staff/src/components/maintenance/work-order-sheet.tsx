"use client";

import { useMemo, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  User,
  Tag,
  CheckSquare,
  Square,
  Clock,
  Hash,
  X,
  Edit2,
  Upload,
  MoreVertical,
  Paperclip,
  Plus,
  MessageSquare,
  GripVertical,
  Flag,
  Send,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  useUpdateWorkOrder,
  useWorkOrderComments,
  useAddWorkOrderComment,
  type WorkOrder,
  type WorkOrderStatus,
} from "@/hooks/use-work-orders";
import { useUpload } from "@/hooks/use-upload";
import { toast } from "sonner";
import { formatShortDate } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import {
  buildPeople,
  STATUS_META,
  PRIORITY_META,
  getInitials,
} from "./maintenance-utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Subtask {
  id: string;
  title: string;
  is_completed: boolean;
}

interface WorkOrderAttachment {
  name: string;
  url: string;
  key: string;
  mime: string;
  size_bytes: number;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetaRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex items-center gap-2 w-32 shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">
          {label}
        </span>
      </div>
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface WorkOrderSheetProps {
  workOrder: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMap: Map<string, { email: string; role: string }>;
  caretakerMap: Map<string, { name: string }>;
}

export function WorkOrderSheet({
  workOrder,
  open,
  onOpenChange,
  staffMap,
  caretakerMap,
}: WorkOrderSheetProps) {
  const updateMutation = useUpdateWorkOrder();
  const addCommentMutation = useAddWorkOrderComment();
  const { upload } = useUpload();
  const { data: comments = [] } = useWorkOrderComments(workOrder?.id ?? "");
  const [updatingSubtask, setUpdatingSubtask] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [commentAttachments, setCommentAttachments] = useState<
    WorkOrderAttachment[]
  >([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCommentFile, setIsUploadingCommentFile] = useState(false);

  if (!workOrder) return null;

  const priorityMeta = PRIORITY_META[workOrder.priority];
  const statusMeta = STATUS_META[workOrder.status];

  const subtasks = (workOrder.subtasks ?? []) as Subtask[];
  const people = buildPeople(workOrder, staffMap, caretakerMap);

  const handleSubtaskToggle = async (subtaskId: string, completed: boolean) => {
    setUpdatingSubtask(subtaskId);
    const updated = subtasks.map((s) =>
      s.id === subtaskId ? { ...s, is_completed: completed } : s,
    );
    try {
      await updateMutation.mutateAsync({
        id: workOrder.id,
        body: { subtasks: updated },
      });
      toast.success(completed ? "Subtask completed" : "Subtask reopened");
    } catch {
      toast.error("Failed to update subtask");
    } finally {
      setUpdatingSubtask(null);
    }
  };

  const handleRemoveSubtask = async (subtaskId: string) => {
    setUpdatingSubtask(subtaskId);
    const updated = subtasks.filter((s) => s.id !== subtaskId);
    try {
      await updateMutation.mutateAsync({
        id: workOrder.id,
        body: { subtasks: updated },
      });
      toast.success("Subtask removed");
    } catch {
      toast.error("Failed to remove subtask");
    } finally {
      setUpdatingSubtask(null);
    }
  };

  const handleStatusChange = async (status: WorkOrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateMutation.mutateAsync({
        id: workOrder.id,
        body: { status },
      });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentBody.trim() && commentAttachments.length === 0) return;
    setIsSubmittingComment(true);
    try {
      await addCommentMutation.mutateAsync({
        workOrderId: workOrder.id,
        body: {
          body: commentBody,
          author_type: "staff",
          is_internal: false,
          attachments: commentAttachments,
        },
      });
      setCommentBody("");
      setCommentAttachments([]);
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCommentFile(true);
    try {
      const res = await upload.mutateAsync({
        file,
        context: "work_order",
      });

      setCommentAttachments((prev) => [
        ...prev,
        {
          name: file.name,
          url: res.url,
          key: res.key,
          mime: res.content_type,
          size_bytes: res.size_bytes,
        },
      ]);
      toast.success("File uploaded to comment");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploadingCommentFile(false);
    }
  };

  const removeCommentAttachment = (key: string) => {
    setCommentAttachments((prev) => prev.filter((a) => a.key !== key));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await upload.mutateAsync({
        file,
        context: "work_order",
        entityId: workOrder.id,
      });

      const updatedAttachments = [
        ...workOrder.attachments,
        {
          name: file.name,
          url: res.url,
          key: res.key,
          mime: res.content_type,
          size_bytes: res.size_bytes,
        },
      ];

      await updateMutation.mutateAsync({
        id: workOrder.id,
        body: { attachments: updatedAttachments },
      });

      toast.success("File uploaded");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = async (key: string) => {
    const updated = workOrder.attachments.filter((a) => a.key !== key);
    try {
      await updateMutation.mutateAsync({
        id: workOrder.id,
        body: { attachments: updated },
      });
      toast.success("Attachment removed");
    } catch {
      toast.error("Failed to remove attachment");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[540px] overflow-y-auto flex flex-col gap-0 p-0 outline-none"
      >
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Work Order Details
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            {/* ── Header ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="h-6 px-2 gap-1.5 font-bold"
                  >
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    {workOrder.code}
                  </Badge>
                </div>
              </div>

              <h2 className="text-2xl font-bold tracking-tight">
                {workOrder.title}
              </h2>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Created on {formatShortDate(workOrder.created_at)}
              </p>

              {/* ── Metadata ── */}
              <div className="space-y-1">
                <MetaRow icon={Clock} label="Status">
                  <Select
                    value={workOrder.status}
                    onValueChange={(v) =>
                      handleStatusChange(v as WorkOrderStatus)
                    }
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-8 w-[140px] rounded-md border-border text-xs font-semibold",
                        statusMeta.badgeClass,
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_META).map(([status, meta]) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="text-xs"
                        >
                          {meta.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </MetaRow>

                <MetaRow icon={Flag} label="Priority">
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-6 px-2 gap-1.5 font-semibold",
                      priorityMeta.className,
                    )}
                  >
                    <Flag
                      className={cn("h-3.5 w-3.5", priorityMeta.iconClass)}
                    />
                    {priorityMeta.label}
                  </Badge>
                </MetaRow>

                <MetaRow icon={User} label="People">
                  <div className="flex items-center gap-2">
                    {people.length > 0 ? (
                      <>
                        <div className="flex -space-x-2">
                          {people.slice(0, 3).map((p) => (
                            <Avatar
                              key={p.id}
                              className="h-6 w-6 border-2 border-background"
                            >
                              <AvatarFallback className="text-[10px] bg-muted font-semibold">
                                {p.initials}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-xs font-medium">
                          {people.map((p) => p.name).join(", ")}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Unassigned
                      </span>
                    )}
                  </div>
                </MetaRow>

                <MetaRow icon={Calendar} label="Due Date">
                  <span className="text-xs font-medium">
                    {workOrder.due_date
                      ? formatShortDate(workOrder.due_date)
                      : "No due date"}
                  </span>
                </MetaRow>

                <MetaRow icon={Tag} label="Category">
                  <Badge
                    variant="outline"
                    className="h-6 px-2 gap-1.5 font-medium bg-muted/30"
                  >
                    <span className="capitalize">
                      {workOrder.category.replace("_", " ")}
                    </span>
                  </Badge>
                </MetaRow>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </span>
                </div>
                <div className="bg-background rounded-xl p-5 border shadow-sm space-y-4">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                    {workOrder.description || "No description provided."}
                  </p>

                  {workOrder.attachments.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {workOrder.attachments.map((file, idx) => {
                        const isImage = file.mime.startsWith("image/");
                        return (
                          <div
                            key={idx}
                            className="group relative flex flex-col rounded-md border bg-background overflow-hidden hover:border-primary/30 transition-all shadow-sm"
                          >
                            {isImage ? (
                              <div className="aspect-video w-full bg-muted/50 flex items-center justify-center overflow-hidden border-b">
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                              </div>
                            ) : (
                              <div className="aspect-video w-full bg-muted/50 flex items-center justify-center border-b">
                                <Paperclip className="h-8 w-8 text-muted-foreground/40" />
                              </div>
                            )}
                            <div className="p-2 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold truncate text-foreground">
                                  {file.name}
                                </p>
                                <p className="text-[9px] text-muted-foreground">
                                  {(file.size_bytes / (1024 * 1024)).toFixed(2)}{" "}
                                  MB
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <Upload className="h-3 w-3 rotate-180" />
                                </a>
                                <button
                                  onClick={() =>
                                    handleRemoveAttachment(file.key)
                                  }
                                  className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/40">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs gap-2 text-muted-foreground hover:text-foreground"
                      disabled={isUploading}
                      onClick={() =>
                        document
                          .getElementById("work-order-file-upload")
                          ?.click()
                      }
                    >
                      {isUploading && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                    </Button>
                  </div>
                  <input
                    id="work-order-file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* ── Comments ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">
                    Comments ({comments.length})
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No comments yet.
                  </p>
                ) : (
                  comments.map((comment) => {
                    const authorName =
                      comment.author_type === "staff"
                        ? (staffMap.get(comment.author_id)?.email ?? "Staff")
                        : comment.author_type === "caretaker"
                          ? (caretakerMap.get(comment.author_caretaker_id ?? "")
                              ?.name ?? "Caretaker")
                          : "User";

                    return (
                      <div key={comment.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 border">
                            <AvatarFallback className="text-[10px] bg-muted font-bold">
                              {getInitials(authorName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold">
                              {authorName}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {formatShortDate(comment.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-background rounded-xl p-4 border shadow-sm space-y-3">
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                            {comment.body}
                          </p>

                          {comment.attachments &&
                            comment.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {comment.attachments.map((file) => (
                                  <a
                                    key={file.key}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-md border bg-background px-2 py-1 text-[10px] font-medium hover:bg-muted/50 transition-colors"
                                  >
                                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                                    <span className="max-w-[150px] truncate">
                                      {file.name}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Comment Input */}
              <div className="space-y-3 pt-2">
                <div className="relative group">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    className="min-h-[120px] resize-none rounded-xl border-border bg-background p-4 pb-12 text-sm focus-visible:ring-1 shadow-sm transition-all group-hover:border-primary/30"
                  />
                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      disabled={isUploadingCommentFile}
                      onClick={() =>
                        document.getElementById("comment-file-upload")?.click()
                      }
                    >
                      {isUploadingCommentFile ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Paperclip className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      id="comment-file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleCommentFileUpload}
                      disabled={isUploadingCommentFile}
                    />
                  </div>
                </div>

                {commentAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {commentAttachments.map((file) => (
                      <div
                        key={file.key}
                        className="flex items-center gap-2 rounded-md border bg-background px-2 py-1 text-[10px] font-medium"
                      >
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                        <span className="max-w-[100px] truncate">
                          {file.name}
                        </span>
                        <button
                          onClick={() => removeCommentAttachment(file.key)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="gap-2 rounded-md px-4"
                    onClick={handleAddComment}
                    disabled={
                      isSubmittingComment ||
                      (!commentBody.trim() && commentAttachments.length === 0)
                    }
                  >
                    Add Comment
                    {isSubmittingComment ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* ── Subtasks ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">
                  Subtasks ({subtasks.length})
                </span>
              </div>

              <div className="space-y-3">
                {subtasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No subtasks.
                  </p>
                ) : (
                  subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="group relative flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground cursor-grab" />
                      <button
                        onClick={() =>
                          handleSubtaskToggle(st.id, !st.is_completed)
                        }
                        disabled={updatingSubtask === st.id}
                        className={cn(
                          "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                          st.is_completed
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30 hover:border-primary",
                        )}
                      >
                        {st.is_completed && <CheckSquare className="h-3 w-3" />}
                      </button>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          st.is_completed &&
                            "line-through text-muted-foreground",
                        )}
                      >
                        {st.title}
                      </span>
                      {updatingSubtask === st.id ? (
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-auto" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto opacity-0 group-hover:opacity-100"
                          onClick={() => handleRemoveSubtask(st.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-rose-500" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
