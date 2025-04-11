
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { Liability, LiabilityType, LIABILITY_TYPE_LABELS } from "./AssetTypes";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  type: z.string().min(1, { message: "Type is required" }),
  value: z.coerce.number().min(0, { message: "Value must be positive" }),
  description: z.string().optional(),
  date: z.string().min(1, { message: "Date is required" }),
});

interface LiabilityFormProps {
  onSave: (liability: Liability) => void;
  onCancel: () => void;
  existingLiability?: Liability;
}

const LiabilityForm: React.FC<LiabilityFormProps> = ({ onSave, onCancel, existingLiability }) => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: existingLiability?.name || "",
      type: existingLiability?.type || "",
      value: existingLiability?.value || 0,
      description: existingLiability?.description || "",
      date: existingLiability?.date || format(new Date(), "yyyy-MM-dd"),
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const now = new Date().toISOString();
    const liability: Liability = {
      id: existingLiability?.id || uuidv4(),
      name: values.name,
      type: values.type as LiabilityType,
      value: values.value,
      description: values.description,
      date: values.date,
      createdAt: existingLiability?.createdAt || now,
      updatedAt: now,
    };

    onSave(liability);
    toast.success(`Liability ${existingLiability ? "updated" : "added"} successfully`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Liability Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter liability name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Liability Type</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select liability type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LIABILITY_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount ({currencySymbol})</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>
                Date of liability creation or recent update
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add additional details about this liability"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="destructive">
            {existingLiability ? "Update" : "Add"} Liability
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LiabilityForm;
