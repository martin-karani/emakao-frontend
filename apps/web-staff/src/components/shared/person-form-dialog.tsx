"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v4";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";

const personSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type PersonFormValues = z.infer<typeof personSchema>;

interface PersonFormDialogProps {
  title: string;
  onAdd: (data: PersonFormValues) => void;
  trigger?: React.ReactElement;
}

export function PersonFormDialog({
  title,
  onAdd,
  trigger,
}: PersonFormDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
  });

  const onSubmit = (data: PersonFormValues) => {
    onAdd(data);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <Button variant="link" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Invite New
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!errors.first_name}>
              <Label>First Name *</Label>
              <Input placeholder="John" {...register("first_name")} />
              {errors.first_name && (
                <FieldError>{errors.first_name.message}</FieldError>
              )}
            </Field>
            <Field data-invalid={!!errors.last_name}>
              <Label>Last Name *</Label>
              <Input placeholder="Doe" {...register("last_name")} />
              {errors.last_name && (
                <FieldError>{errors.last_name.message}</FieldError>
              )}
            </Field>
          </div>
          <Field data-invalid={!!errors.email}>
            <Label>Email *</Label>
            <Input
              type="email"
              placeholder="john@example.com"
              {...register("email")}
            />
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>
          <Field>
            <Label>Phone</Label>
            <Input placeholder="+254..." {...register("phone")} />
          </Field>
          <DialogFooter>
            <Button type="submit" className="w-full">
              Confirm & Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
