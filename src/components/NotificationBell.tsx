import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

/** Returns a human-readable relative time string (e.g. "3m ago") */
function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/** Map notification type → accent colour class */
function typeAccent(type: string): string {
  switch (type) {
    case "invite_received":
      return "bg-amber-500";
    case "invite_accepted":
      return "bg-emerald-500";
    case "invite_declined":
    case "invite_revoked":
    case "athlete_removed":
      return "bg-destructive";
    default:
      return "bg-primary";
  }
}

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllRead } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
          id="notification-bell-btn"
        >
          <Bell className="h-4 w-4" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-amber-500 text-[9px] font-bold text-white flex items-center justify-center px-0.5 leading-none"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 shadow-xl border border-border rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <h3 className="font-display font-semibold text-sm text-foreground">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
              onClick={markAllRead}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[380px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-xs">No notifications yet</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {notifications.map((notif, i) => (
                <motion.button
                  key={notif.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  className={cn(
                    "w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 transition-colors",
                    notif.is_read
                      ? "bg-background hover:bg-muted/30"
                      : "bg-muted/40 hover:bg-muted/60"
                  )}
                >
                  {/* Accent dot */}
                  <span
                    className={cn(
                      "mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
                      notif.is_read ? "bg-muted-foreground/30" : typeAccent(notif.type)
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-xs leading-snug",
                        notif.is_read
                          ? "text-muted-foreground"
                          : "text-foreground font-medium"
                      )}
                    >
                      {notif.title}
                    </p>
                    {notif.body && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                        {notif.body}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {timeAgo(notif.created_at)}
                    </p>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
