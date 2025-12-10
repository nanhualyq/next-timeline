import Article from "@/app/article/[id]/page";
import { Modal } from "antd";
import CloseButton from "./CloseButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ArticleDialog(props: Props) {
  return (
    <Modal
      open={true}
      footer={false}
      closable={false}
      centered={true}
      width="96%"
      styles={{
        container: {
          padding: 0,
        },
      }}
    >
      <CloseButton />
      <Article params={props.params} height="90vh" inModal={true} />
    </Modal>
  );
}
