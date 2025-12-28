"use client";
import { channelTable } from "@/src/db/schema";
import { useRequest } from "ahooks";
import { createUpdateSchema } from "drizzle-zod";
import { useRouter } from "next/navigation";
import z from "zod";
import Swal from "sweetalert2";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

type Channel = typeof channelTable.$inferSelect;
interface Props {
  channel: Channel;
  save: (newChannel: Channel) => Promise<void>;
}

export default function ChannelEditForm({ channel, save }: Props) {
  const router = useRouter();
  const keys = Object.keys(channel);
  const formSchema = createUpdateSchema(channelTable, {
    link: () => z.url(),
    icon: () => z.union([z.url(), z.literal("")]).optional(),
    title: () => z.string().min(1, "required"),
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: channel,
  });

  const { loading, run } = useRequest(save, {
    manual: true,
    onSuccess() {
      router.refresh();
    },
    onError(error) {
      Swal.fire(error + "");
    },
  });

  return (
    <form onSubmit={form.handleSubmit((data) => run(data as Channel))}>
      <Card>
        <CardContent>
          <FieldGroup>
            {keys.map((k) => (
              <Controller
                key={k}
                name={k as "id"}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`from-label-channel-edit-${k}`}>
                      {k}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`from-label-channel-edit-${k}`}
                      data-invalid={fieldState.invalid}
                      autoComplete="off"
                      disabled={["id", "type"].includes(k)}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            ))}
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type="submit" disabled={loading}>
              Submit
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </form>
  );
}
