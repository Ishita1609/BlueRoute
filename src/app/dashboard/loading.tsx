import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center">
      <Loader2 className="size-6 animate-spin" style={{ color: "#1E3A5F" }} />
    </div>
  );
}
