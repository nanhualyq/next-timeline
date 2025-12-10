"use client";
import AddForm from "@/app/(timeline)/channel/add/AddForm";
import { Modal } from "antd";
import { useRouter } from "next/navigation";

export default function ChannelAddDialog() {
  const router = useRouter();
  return (
    <Modal
      open={true}
      onCancel={router.back}
      footer={null}
      keyboard={false}
      maskClosable={false}
    >
      <AddForm />
    </Modal>
  );
}
