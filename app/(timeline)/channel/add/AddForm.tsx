"use client";
import { postFeed } from "@/app/actions";
import { useRequest } from "ahooks";
import { Button, Form, Input, message, Modal } from "antd";

export default function AddForm() {
  const [messageApi, contextHolder] = message.useMessage();
  const { loading, run } = useRequest(postFeed, {
    manual: true,
    onSuccess() {
      messageApi.open({ type: "success", content: "success" });
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
      <Form onFinish={run}>
        <Form.Item label="url" name="url" rules={[{ required: true }]}>
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
