"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAppSelector } from "@/lib/hooks";
import type { CreateLeaveInput } from "../leaveService";
import { useAddLeave } from "../useLeaves";

export function AddLeaveDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const user = useAppSelector((s) => s.auth.user);
  const orgId = user?.organization?.id ?? "";

  const [form, setForm] = useState<CreateLeaveInput>({
    type: "Vacation",
    startDate: "",
    endDate: "",
    reason: "",
    days: 0,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutate: addLeave, isPending } = useAddLeave();

  const handleSubmit = () => {
    if (!form.startDate || !form.endDate) {
      setErrorMsg("Start and end dates are required.");
      return;
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);

    if (end < start) {
      setErrorMsg("End date must be after start date.");
      return;
    }

    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    setErrorMsg(null);
    addLeave(
      { ...form, days, organizationId: orgId },
      {
        onSuccess: () => {
          onSuccess();
          onOpenChange(false);
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            "Something went wrong. Please try again.";
          setErrorMsg(msg);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Request Leave
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Type */}
          <div className="space-y-1">
            <Label>Leave Type</Label>
            <Select
              value={form.type}
              onValueChange={(type) => setForm({ ...form, type })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vacation">Vacation</SelectItem>
                <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Maternity">Maternity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>End Date</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <Label>Reason</Label>
            <Input
              placeholder="Enter reason for leave"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-destructive font-medium">{errorMsg}</p>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
