import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useGetSessions,
  useSwitchSession,
  useRemoveSession,
} from "@/features/auth/useSession";
import { Loader, Plus, Trash2 } from "lucide-react";
import { useAppDispatch } from "@/lib/hooks";
import { queryClient } from "./Providers";

export function AccountSwitcherDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: sessions, isLoading } = useGetSessions();
  const { mutate: switchSession } = useSwitchSession();
  const { mutate: removeSession, isPending: removing } = useRemoveSession();
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const handleSwitch = (userId: string) => {
    setSwitchingId(userId);
    switchSession(userId, {
      onSuccess: (user) => {
        dispatch.auth.setUser(user);
        setTimeout(() => {
          queryClient.clear();
          setSwitchingId(null);
          onOpenChange(false);
          window.location.reload();
        }, 100);
      },
      onError: () => setSwitchingId(null),
    });
  };

  const handleRemove = (userId: string) => {
    setRemovingId(userId);
    queryClient.clear();
    removeSession(userId, {
      onSuccess: () => {
        queryClient.invalidateQueries(["sessions"] as any);
        setRemovingId(null);
      },
      onError: () => setRemovingId(null),
    });
  };

  const handleAddAccount = () => {
    onOpenChange(false);
    setTimeout(() => {
      window.location.href = "/login";
    }, 50);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full rounded-lg bg-background shadow-2xl p-0 border-none">
        <DialogHeader>
          <DialogTitle className="text-lg px-7 pt-7 pb-0 flex items-center font-semibold">
            Switch Account
          </DialogTitle>
        </DialogHeader>
        <div className="px-7 pt-1 pb-5">
          <p className="text-sm text-muted-foreground mb-4">
            Choose an account or add a new one. Removing a session is safe.
          </p>
          <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
            {isLoading ? (
              <div className="h-20 flex items-center justify-center text-sm">
                Loading... <Loader className=" h-6 w-6 animate-spin"></Loader>
              </div>
            ) : (sessions?.length ?? 0) > 0 ? (
              sessions!.map((session) => (
                <div
                  key={session.id}
                  className={
                    "flex items-center group gap-3 rounded-lg px-3 py-2 transition" +
                    (session.isActive
                      ? " bg-primary/5 font-semibold"
                      : " hover:bg-muted/40")
                  }
                  tabIndex={0}
                  role="group"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-base uppercase">
                    {session.username.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-base">{session.username}</div>
                    {/* Optionally, show email or org */}
                    <div className="truncate text-xs text-muted-foreground/70">
                      {session.email}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!session.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-3 text-xs"
                        onClick={() => handleSwitch(session.id)}
                        disabled={!!switchingId}
                      >
                        {switchingId === session.id ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          "Switch"
                        )}
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground"
                      title="Remove session"
                      onClick={() => handleRemove(session.id)}
                      disabled={removing && removingId === session.id}
                    >
                      {removing && removingId === session.id ? (
                        <Loader className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-center text-muted-foreground py-4">
                No accounts yet.
              </div>
            )}
          </div>
          <Button
            onClick={handleAddAccount}
            className="w-full rounded-md gap-2 py-3 mt-7"
            variant="outline"
            size="lg"
          >
            <Plus className="w-5 h-5" /> Add account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
