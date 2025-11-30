import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, User, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface ProfileModalProps {
  user: Doc<"users">;
}

export function ProfileModal({ user }: ProfileModalProps) {
  const { signOut } = useAuth();
  const updateUser = useMutation(api.users.update);
  const [open, setOpen] = useState(false);

  const handleOtpToggle = async (checked: boolean) => {
    try {
      await updateUser({ otpEnabled: checked });
      toast.success(`OTP on login ${checked ? "enabled" : "disabled"}`);
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image} alt={user.name || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image} alt={user.name || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <h3 className="font-medium leading-none">{user.name || "User"}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="flex items-center space-x-4">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label className="text-base">Two-factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">
                    Require OTP when logging in
                  </p>
                </div>
              </div>
              <Switch
                checked={user.otpEnabled !== false} // Default to true if undefined
                onCheckedChange={handleOtpToggle}
                disabled // Disabled because we can't change the auth provider dynamically in this setup
                title="This feature is managed by the system administrator"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              variant="destructive" 
              className="w-full sm:w-auto gap-2"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
