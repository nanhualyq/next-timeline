"use client";
import { channelTable } from "@/src/db/schema";
import { useRequest } from "ahooks";
import { Button, Form, Input, Modal, Space, Spin } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { createUpdateSchema } from "drizzle-zod";
import { useRouter } from "next/navigation";
import z from "zod";

type Channel = typeof channelTable.$inferSelect;
interface Props {
  channel: Channel;
  save: (newChannel: Channel) => Promise<void>;
}

export default function ChannelEditForm({ channel, save }: Props) {
  const router = useRouter();
  const [form] = Form.useForm();
  const keys = Object.keys(channel);
  const schema = createUpdateSchema(channelTable, {
    link: () => z.url(),
    icon: () => z.union([z.url(), z.literal("")]).optional(),
    title: () => z.string().min(1, "required"),
  });
  const rule = createSchemaFieldRule(schema);

  const { loading, run } = useRequest(save, {
    manual: true,
    onSuccess() {
      router.push(`/?channel=${channel.id}`);
      location.reload();
    },
    onError(error) {
      const modal = Modal.error({
        content: error + "",
        onOk() {
          modal.destroy();
        },
      });
    },
  });

  return (
    <Form
      form={form}
      initialValues={channel}
      style={{ padding: "1rem" }}
      labelCol={{ span: 2 }}
      onFinish={run}
    >
      {loading && <Spin fullscreen />}
      {keys.map((k) => {
        return (
          <Form.Item
            key={k}
            label={k}
            name={k}
            hidden={k === "id"}
            rules={[rule]}
          >
            <Input />
          </Form.Item>
        );
      })}
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={() => form.resetFields()}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
