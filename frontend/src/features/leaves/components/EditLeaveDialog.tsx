"use client";

import { useState, useEffect } from "react";
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
import type { Leave } from "../leaveService";
import { useUpdateLeave } from "../useLeaves";

export function EditLeaveDialog({
  leave,
  open,
  onOpenChange,
  onSuccess,
}: {
  leave: Leave;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState(leave);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { mutate: updateLeave, isPending } = useUpdateLeave();

  useEffect(() => {
    setForm(leave);
  }, [leave]);

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
    updateLeave(
      {
        id: form.id,
        data: {
          type: form.type,
          reason: form.reason,
          startDate: form.startDate,
          endDate: form.endDate,
          days,
          status: form.status,
        },
      },
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
            Edit Leave Request
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vacation">Vacation</SelectItem>
                <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Maternity">Maternity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(status) =>
                setForm({ ...form, status: status as Leave["status"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
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
            {isPending ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
