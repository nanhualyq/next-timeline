"use client";
import { channelCrawler } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRequest } from "ahooks";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import Swal from "sweetalert2";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function AddForm() {
  const formSchema = z.object({
    type: z.string(),
    link: z.url(),
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "rss",
      link: "",
    },
  });
  const router = useRouter();
  const { loading, run } = useRequest(channelCrawler, {
    manual: true,
    onSuccess(data) {
      toast("success");
      if (data.id) {
        router.push(`/?channel=${data.id}`);
        location.reload();
      }
    },
    onError(error) {
      Swal.fire(error + "");
    },
  });

  return (
    <form onSubmit={form.handleSubmit(run)} style={{ padding: "1rem" }}>
      <FieldGroup>
        <Controller
          name="type"
          control={form.control}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="channel-form-type">Type</FieldLabel>
              <Input
                {...field}
                id="channel-form-type"
                data-invalid={fieldState.invalid}
                autoComplete="off"
                disabled
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="link"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="channel-form-link">Feed Address</FieldLabel>
              <Input
                {...field}
                id="channel-form-link"
                data-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button disabled={loading}>Submit</Button>
    </form>
  );
}
