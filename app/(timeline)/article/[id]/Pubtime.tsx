import { formatDistance } from "date-fns";

interface Props {
  time: string | null;
}

export default function Pubtime({ time }: Props) {
  if (!time) {
    return null;
  }
  let isoTime = time;
  if (time.includes(" ")) {
    isoTime = time.replace(" ", "T") + "Z";
  }
  return <span title={time}>{formatDistance(new Date(), isoTime)}</span>;
}
