import { UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ChatAvatarProps = {
  size: "list" | "header";
};

export function ChatAvatar({ size }: ChatAvatarProps) {
  return (
    <Avatar
      className={cn(size === "list" ? "size-14" : "size-10", "after:hidden")}
    >
      <AvatarFallback className="bg-blue-500 text-white">
        <UserIcon className={size === "list" ? "size-7" : "size-5"} />
      </AvatarFallback>
    </Avatar>
  );
}
