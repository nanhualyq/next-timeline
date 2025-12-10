import Link from "next/link";
import { Button } from "antd";

interface Props {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default async function Layout({ children, modal }: Props) {
  return (
    <>
      <Link href="/channel/add">
        <Button>add feed</Button>
      </Link>
      {children}
      {modal}
    </>
  );
}
