"use client";

import { channelTable } from "@/src/db/schema";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconArrowLeft } from "@tabler/icons-react";
import { Controller } from "react-hook-form";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { get } from "lodash-es";

type Channel = typeof channelTable.$inferSelect;
interface Props {
  onSubmit: (data: Channel) => Promise<unknown>;
  channel?: Channel;
}

export default function EditForm({ onSubmit, channel }: Props) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<Channel>({
    defaultValues: channel || { type: "rss" },
  });
  const type = watch("type");
  let fields = ["title", "link", "description", "category", "icon"];
  if (!channel && type === "rss") {
    fields = ["link"];
  }
  const router = useRouter();

  function insertCode() {
    const html = `return Array.from(document.querySelectorAll('#zyqh dl'))
.map(el => ({
    title: el.querySelector('.wzdf > a').textContent,
    link: el.querySelector('a').href,
    summary: '',
    content: '',
    pub_time: '',
    cover: el.querySelector('a > img').src,
    author: ''
}))`;
    setValue("items_code", html);
  }

  function submitWrapper(data: Channel) {
    onSubmit(data)
      .then((res) => {
        router.refresh();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Go channel list?",
          showCancelButton: true,
          confirmButtonText: "Go",
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(`/?channel_id=${channel?.id || get(res, "id")}`);
          }
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error,
        });
      });
  }

  return (
    <div className="p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="flex">
                <IconArrowLeft />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Channel {channel ? "Edit" : "Add"}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <form
        onSubmit={handleSubmit(submitWrapper)}
        onReset={() => reset(channel)}
        className="flex flex-col gap-2"
        autoComplete="off"
      >
        <FieldGroup>
          <Controller
            name="type"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="channel-form-type">Type</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="channel-form-type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rss">Rss</SelectItem>
                    <SelectItem value="html">Html</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {fields.map((fieldKey) => (
            <Controller
              key={fieldKey}
              name={fieldKey as keyof Channel}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`channel-form-${fieldKey}`}>
                    {fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}
                  </FieldLabel>
                  <Input
                    {...(field as { value: string })}
                    id={`channel-form-${fieldKey}`}
                    data-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          ))}

          {type !== "rss" && (
            <Controller
              name="items_code"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="channel-form-items_code">
                    Items Code
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={insertCode}
                    >
                      Insert Example Code
                    </Button>
                  </FieldLabel>
                  <Textarea
                    {...(field as { value: string })}
                    id="channel-form-items_code"
                    rows={10}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}
        </FieldGroup>
        <Button type="submit" value="Submit" disabled={isSubmitting}>
          Submit
        </Button>
        <Button type="reset" variant="outline">
          Reset
        </Button>
      </form>
    </div>
  );
}
