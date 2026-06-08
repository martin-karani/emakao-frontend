"use client";

import { useState } from "react";
import { useWorkflows, useCreateWorkflow, useDeleteWorkflow, WorkflowRule } from "@/hooks/use-workflows";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  Loader2, 
  PlayCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function WorkflowsPage() {
  const { data: workflows, isLoading } = useWorkflows();
  const deleteMutation = useDeleteWorkflow();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workflow rule?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Workflow rule deleted");
    } catch (error) {
      toast.error("Failed to delete workflow");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GitBranch className="h-6 w-6" />
            Automations & Workflows
          </h1>
          <p className="text-muted-foreground">
            Set up automatic actions based on system events.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Workflow
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule Name</TableHead>
              <TableHead>Event Trigger</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Delay</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No workflows configured yet.
                </TableCell>
              </TableRow>
            ) : (
              workflows?.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{rule.event_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.is_active ? "default" : "outline"}>
                      {rule.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{rule.offset_hours} hours</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="grid gap-1">
            <h3 className="text-sm font-semibold text-yellow-800">Pro Tip: Automated Notifications</h3>
            <p className="text-xs text-yellow-700 leading-relaxed">
              You can create a workflow triggered by <strong>invoice.created</strong> to automatically 
              send an SMS or Email notification to residents as soon as their rent and utility bills 
              are ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
