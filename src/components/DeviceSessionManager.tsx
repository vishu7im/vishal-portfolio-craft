import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from './ui/collapsible';
import { 
  Smartphone, 
  MessageSquare, 
  ChevronDown, 
  ChevronRight,
  Calendar,
  Clock,
  Activity,
  Users,
  Database
} from 'lucide-react';
import { db } from '../services/firebaseConfig';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where,
  Timestamp 
} from 'firebase/firestore';

interface Device {
  device_id: string;
  sessions: Session[];
  totalSessions: number;
}

interface Session {
  id: string;
  session_id: string;
  device_id: string;
  description: string;
  status: string;
  created_at: Date;
  updated_at: Timestamp;
  messageCount?: number;
}

export default function DeviceSessionManager() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDevices, setExpandedDevices] = useState<Set<string>>(new Set());
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const fetchDevicesAndSessions = async () => {
    setLoading(true);
    try {
      // Fetch all active sessions
      const sessionsQuery = query(
        collection(db, 'sessions'),
        where('status', '==', 'ACTIVE'),
        orderBy('updated_at', 'desc'),
        limit(100)
      );

      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions: Session[] = [];
      
      sessionsSnapshot.forEach(doc => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          session_id: data.session_id,
          device_id: data.device_id,
          description: data.description,
          status: data.status,
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at
        });
      });

      // Group sessions by device_id
      const deviceMap = new Map<string, Device>();
      
      for (const session of sessions) {
        const deviceId = session.device_id;
        
        if (!deviceMap.has(deviceId)) {
          deviceMap.set(deviceId, {
            device_id: deviceId,
            sessions: [],
            totalSessions: 0
          });
        }
        
        // Get message count for this session
        const messagesQuery = query(
          collection(db, 'messages'),
          where('session_id', '==', session.session_id),
          limit(1000)
        );
        
        const messagesSnapshot = await getDocs(messagesQuery);
        session.messageCount = messagesSnapshot.docs.length;
        
        const device = deviceMap.get(deviceId)!;
        device.sessions.push(session);
        device.totalSessions++;
      }

      // Convert map to array and sort by total sessions
      const deviceList = Array.from(deviceMap.values())
        .sort((a, b) => b.totalSessions - a.totalSessions);

      setDevices(deviceList);
    } catch (error) {
      console.error('Error fetching devices and sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevicesAndSessions();
  }, []);

  const toggleDevice = (deviceId: string) => {
    const newExpanded = new Set(expandedDevices);
    if (newExpanded.has(deviceId)) {
      newExpanded.delete(deviceId);
    } else {
      newExpanded.add(deviceId);
    }
    setExpandedDevices(newExpanded);
  };

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const formatDate = (date: Date | Timestamp) => {
    const d = date instanceof Timestamp ? date.toDate() : date;
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Device & Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Loading devices and sessions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Device & Session Management
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Smartphone className="h-4 w-4" />
            <span>{devices.length} Devices</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{devices.reduce((acc, device) => acc + device.totalSessions, 0)} Sessions</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDevicesAndSessions}
            className="ml-auto"
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {devices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No devices found</p>
                <p className="text-sm">Devices will appear here when users start chatting</p>
              </div>
            ) : (
              devices.map((device) => (
                <Collapsible
                  key={device.device_id}
                  open={expandedDevices.has(device.device_id)}
                  onOpenChange={() => toggleDevice(device.device_id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start p-4 h-auto border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3 w-full">
                        {expandedDevices.has(device.device_id) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                        <Smartphone className="h-5 w-5 text-primary" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">Device: {device.device_id}</div>
                          <div className="text-sm text-muted-foreground">
                            {device.totalSessions} session{device.totalSessions !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {device.totalSessions}
                        </Badge>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-2 ml-4 space-y-2">
                    {device.sessions.map((session) => (
                      <Collapsible
                        key={session.session_id}
                        open={expandedSessions.has(session.session_id)}
                        onOpenChange={() => toggleSession(session.session_id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start p-3 h-auto border rounded-lg hover:bg-muted/30"
                          >
                            <div className="flex items-center gap-3 w-full">
                              {expandedSessions.has(session.session_id) ? 
                                <ChevronDown className="h-3 w-3" /> : 
                                <ChevronRight className="h-3 w-3" />
                              }
                              <MessageSquare className="h-4 w-4 text-blue-500" />
                              <div className="flex-1 text-left">
                                <div className="font-medium text-sm">{session.description}</div>
                                <div className="text-xs text-muted-foreground">
                                  {session.messageCount || 0} messages
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {session.status}
                              </Badge>
                            </div>
                          </Button>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="mt-2 ml-6 p-3 bg-muted/30 rounded-lg">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Created:</span>
                              <span className="text-xs">{formatDate(session.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Last Updated:</span>
                              <span className="text-xs">{formatDate(session.updated_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Session ID:</span>
                              <span className="text-xs font-mono">{session.session_id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Messages:</span>
                              <span className="text-xs">{session.messageCount || 0}</span>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}