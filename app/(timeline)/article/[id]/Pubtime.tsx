import { formatDistance } from "date-fns";

interface Props {
  time: string | null;
}

export default function Pubtime({ time }: Props) {
  if (!time) {
    return null;
  }
  return <span title={time}>{formatDistance(new Date(), time)}</span>;
}
