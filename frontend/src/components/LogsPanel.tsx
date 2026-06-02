import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, User, Mail, Calendar, Tag, AlertCircle } from "lucide-react";

interface TicketLog {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  description: string;
  status: string;
  createdAt: number;
  departmentId: string;
  departmentName: string;
  agent?: {
    department: string;
    urgency: string;
    summary: string;
    action: string;
  };
}

const LogsPanel = () => {
  const [logs, setLogs] = useState<TicketLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/tickets/list");
      const data = await response.json();
      setLogs(Array.isArray(data) ? data : data.tickets || []);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "closed": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-background/10 border-border/30 text-foreground hover:bg-background/20"
        >
          <FileText className="w-4 h-4 mr-2" />
          View Logs
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[450px] sm:w-[540px] bg-background border-border/30">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Ticket Logs
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-100px)] mt-6 pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              No logs found
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="bg-card/50 border border-border/30 rounded-lg p-4 space-y-3"
                >
                  {/* Header with status */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(log.status)}`}>
                      {log.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {log.id.slice(0, 8)}...
                    </span>
                  </div>

                  {/* Student Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-foreground font-medium">{log.studentName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{log.studentEmail}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-foreground/80 bg-background/30 rounded p-2">
                    {log.description}
                  </p>

                  {/* Department & Date */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-primary" />
                      <span className="text-primary">{log.departmentName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(log.createdAt)}</span>
                    </div>
                  </div>

                  {/* Agent Info */}
                  {log.agent && (
                    <div className="border-t border-border/20 pt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className={`w-3 h-3 ${getUrgencyColor(log.agent.urgency)}`} />
                        <span className={`text-xs ${getUrgencyColor(log.agent.urgency)}`}>
                          {log.agent.urgency?.toUpperCase()} URGENCY
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        "{log.agent.summary}"
                      </p>
                      <p className="text-xs text-foreground/70">
                        Action: {log.agent.action}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default LogsPanel;
