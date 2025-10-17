import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { calculatePrice, durationOptions, formatPrice } from "@/lib/pricing";

type BookingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerId: string;
  workerName: string;
  listingId: string;
  defaultRate: string;
};

export function BookingDialog({
  open,
  onOpenChange,
  workerId,
  workerName,
  listingId,
  defaultRate,
}: BookingDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [date, setDate] = useState<Date>();
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const quote = calculatePrice(duration, parseFloat(defaultRate) || 25);

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/bookings", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "bookings"] });
      toast({
        title: "Booking request sent!",
        description: `${workerName} will be notified and can accept your request.`,
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You must be logged in to book a service.",
        variant: "destructive",
      });
      return;
    }

    if (!date || !location) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createBookingMutation.mutate({
      clientId: user.id,
      workerId,
      listingId,
      quotedTotal: quote.total.toString(),
      duration,
      scheduledFor: date.toISOString(),
      location,
      notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Service with {workerName}</DialogTitle>
          <DialogDescription>
            Fill in the details for your booking request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Preferred Date & Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  data-testid="button-select-booking-date"
                >
                  <CalendarIcon className="mr-2 w-4 h-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select
              value={duration.toString()}
              onValueChange={(v) => setDuration(Number(v))}
            >
              <SelectTrigger data-testid="select-booking-duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter service location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              data-testid="input-booking-location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requirements or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-testid="input-booking-notes"
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Estimated Total</span>
              <span className="text-2xl font-bold text-primary" data-testid="text-booking-total">
                {formatPrice(quote.total)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{quote.breakdown}</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-booking"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createBookingMutation.isPending}
            data-testid="button-confirm-booking"
          >
            {createBookingMutation.isPending ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
