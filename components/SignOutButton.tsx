"use client";

import { signOut } from "@/lib/auth/auth-client";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

export default function SignOutButton() {
  const router = useRouter();

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onClick={async () => {
        const result = await signOut();
        if (result.data) {
          posthog.capture("user_logged_out");
          posthog.reset();
          router.push("/login");
        } else {
          alert("Error signing out");
        }
      }}
    >
      Log Out
    </DropdownMenuItem>
  );
}
