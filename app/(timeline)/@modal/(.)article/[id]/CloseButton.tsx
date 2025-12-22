"use client";
import { IconX } from "@tabler/icons-react";
import { useKeyPress } from "ahooks";
import { useRouter } from "next/navigation";

export default function CloseButton() {
  const router = useRouter();

  function close() {
    router.back();
  }

  useKeyPress(["enter"], close);
  useKeyPress(["esc"], close, {
    events: ["keyup"],
  });

  return (
    <IconX
      style={{
        position: "absolute",
        right: "2rem",
        top: "2rem",
        fontSize: "160%",
      }}
      onClick={close}
    />
  );
}
