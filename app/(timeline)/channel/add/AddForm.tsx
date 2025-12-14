"use client";
import { channelCrawler } from "@/app/actions";
import { useRequest } from "ahooks";
import { Button, Form, Input, message, Modal } from "antd";
import { useRouter } from "next/navigation";

export default function AddForm() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const { loading, run } = useRequest(channelCrawler, {
    manual: true,
    onSuccess(data) {
      messageApi.open({ type: "success", content: "success" });
      if (data.id) {
        router.push(`/?channel=${data.id}`);
        location.reload();
      }
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
    <>
      {contextHolder}
      <Form onFinish={run} style={{ padding: "1rem" }}>
        <Form.Item name="type" initialValue="rss" hidden>
          <Input />
        </Form.Item>
        <Form.Item
          label="feed address"
          name="link"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={null}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
