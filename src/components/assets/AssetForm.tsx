
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { Asset, AssetType, ASSET_TYPE_LABELS } from "./AssetTypes";
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

interface AssetFormProps {
  onSave: (asset: Asset) => void;
  onCancel: () => void;
  existingAsset?: Asset;
}

const AssetForm: React.FC<AssetFormProps> = ({ onSave, onCancel, existingAsset }) => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: existingAsset?.name || "",
      type: existingAsset?.type || "",
      value: existingAsset?.value || 0,
      description: existingAsset?.description || "",
      date: existingAsset?.date || format(new Date(), "yyyy-MM-dd"),
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const now = new Date().toISOString();
    const asset: Asset = {
      id: existingAsset?.id || uuidv4(),
      name: values.name,
      type: values.type as AssetType,
      value: values.value,
      description: values.description,
      date: values.date,
      createdAt: existingAsset?.createdAt || now,
      updatedAt: now,
    };

    onSave(asset);
    toast.success(`Asset ${existingAsset ? "updated" : "added"} successfully`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter asset name" {...field} />
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
              <FormLabel>Asset Type</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ASSET_TYPE_LABELS).map(([key, label]) => (
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
              <FormLabel>Value ({currencySymbol})</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter value"
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
                Date of asset acquisition or valuation
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
                  placeholder="Add additional details about this asset"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full resize-none overflow-hidden break-words px-3 py-2 border rounded focus:outline-none">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {existingAsset ? "Update" : "Add"} Asset
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AssetForm;
