import Article from "@/app/(timeline)/article/[id]/page";
import CloseButton from "./CloseButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ArticleDialog(props: Props) {
  return (
    <dialog
      open
      className="fixed top-[4vh] m-auto w-[96vw] h-[92vh] border-2 border-stone-600 rounded-md [&_a]:text-blue-600 [&_h1]:text-2xl z-[99]"
    >
      <CloseButton />
      <Article params={props.params} height="90vh" inModal={true} />
    </dialog>
  );
}
