import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Bot, ChevronLeft, ChevronRight, MessageSquare, Plus, Send, Trash2, User, X, Loader2 } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import axios from "axios";
import { db } from "../services/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

import { collection, query, where, orderBy, limit, startAfter, getDocs, addDoc, Timestamp, doc, updateDoc } from "firebase/firestore";

interface Message {
  message_id: string;
  device_id: string;
  session_id: string;
  role: "model" | "user";
  message: string;
  created_at: Date;
}

interface ChatSession {

  id: string;
  device_id: string;
  session_id: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  messages?: Message[];
  created_at: Date;
}


const SESSION_SIZE = 10
const MESSAGE_SIZE = 10

interface ChatBotProps {
  isVisible: boolean;
  onToggle: () => void;
}

const STORAGE_KEY = "ai-chatbot-sessions";





// Reusable Loader Component
const Loader = ({ size = "sm", text = "Loading...", className = "" }: { size?: "xs" | "sm" | "md", text?: string, className?: string }) => {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

export default function ChatBot({ isVisible, onToggle }: ChatBotProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [lastSessionDoc, setLastSessionDoc] = useState<any>(null); // For pagination
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionHasMore, setSessionHasMore] = useState(true);
  const [lastMessageDoc, setLastMessageDoc] = useState<any>(null); // For pagination
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageHasMore, setMessageHasMore] = useState(true);
  const [activeId, setActiveId] = useState<string>(() => sessions[0]?.session_id || "");
  const [deviceId, setDeviceId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Check if we're on a mobile device
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 640; // 640px is the 'sm' breakpoint in Tailwind
    }
    return true; // Default to open on server-side
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastScrollTime, setLastScrollTime] = useState(0);

  // New loading states
  const [creatingSession, setCreatingSession] = useState(false);
  const [deletingSession, setDeletingSession] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFetchingRef = useRef(false);
  const isFetchingMessageRef = useRef(false);




  const fetchSessions = async (id: string) => {
    console.log("fetching sessions", id)

    let device_id = id || deviceId;

    if (!device_id) return;
    if (sessionLoading || !sessionHasMore || isFetchingRef.current) {
      console.log("Skipping fetch - loading:", sessionLoading, "hasMore:", sessionHasMore, "isFetching:", isFetchingRef.current);
      return;
    }

    console.log("Starting to fetch sessions...");
    setSessionLoading(true);
    isFetchingRef.current = true;

    try {
      let q = query(
        collection(db, "sessions"),
        where("device_id", "==", device_id),
        where("status", "==", "ACTIVE"),
        orderBy("created_at", "desc"),
        limit(SESSION_SIZE)
      );

      if (lastSessionDoc) {
        q = query(q, startAfter(lastSessionDoc));
      }

      const snapshot = await getDocs(q);
      const fetchedSessions: ChatSession[] = [];

      snapshot.forEach(doc => {
        fetchedSessions.push({ id: doc.id, ...(doc.data() as ChatSession) });
      });

      console.log("Fetched sessions:", fetchedSessions.length);

      if (snapshot.docs.length < SESSION_SIZE) {
        setSessionHasMore(false);
        console.log("No more sessions to load");
      }

      if (snapshot.docs.length > 0) {
        setLastSessionDoc(snapshot.docs[snapshot.docs.length - 1]);
      }

      // If no sessions exist at all, create a default one
      if (sessions.length === 0 && fetchedSessions.length === 0) {

        const session_id = uuidv4()
        const newSessionRef = await addDoc(collection(db, "sessions"), {
          device_id: device_id,
          session_id: session_id,
          description: "New Chat",
          status: "ACTIVE",
          created_at: new Date()
        });

        // create an welcome message
        const message_id = uuidv4()
        await addDoc(collection(db, "messages"), {
          device_id: device_id,
          session_id: session_id,
          message_id: message_id,
          message: "Hi! I'm Vishal's AI assistant. Ask me anything about his experience, projects, or skills!",
          role: "model",
          created_at: new Date()
        });

        // console.log({
        //   device_id: device_id,
        //   session_id: session_id,
        //   description: "New Chat",
        //   status: "ACTIVE",
        //   created_at: new Date()
        // })

        fetchedSessions.push({

          id: newSessionRef.id,
          device_id: device_id,
          session_id: session_id,
          description: "New Chat",
          status: "ACTIVE",
          messages: [
            {
              message_id: message_id,
              device_id: device_id,
              session_id: session_id,
              role: "model",
              message: "Hi! I'm Vishal's AI assistant. Ask me anything about his experience, projects, or skills!",
              created_at: new Date()
            }
          ],
          created_at: new Date()
        });
      }

      console.table(fetchedSessions)
      setSessions(prev => [...prev, ...fetchedSessions]);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setSessionLoading(false);
      isFetchingRef.current = false;
      console.log("Finished fetching sessions");
    }
  }

  const handleSessionScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const now = Date.now();

    // Throttle scroll events to prevent excessive API calls
    if (now - lastScrollTime < 1000) { // Increased to 1 second
      return; // Ignore scroll events that are too frequent
    }

    console.log("handleSessionScroll triggered", deviceId)
    if (!deviceId) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    console.log("Scroll values:", { scrollTop, scrollHeight, clientHeight, sessionHasMore, sessionLoading });

    // Check if we're near the bottom (within 50px) and can load more
    if (scrollHeight - scrollTop <= clientHeight + 50 && sessionHasMore && !sessionLoading) {
      console.log("Loading more sessions...");
      setLastScrollTime(now);

      console.log("*******************************Loading more sessions...***************************************");
      fetchSessions(deviceId);
    }
  }, [deviceId, sessionHasMore, sessionLoading, lastScrollTime]);

  const loadMessages = useCallback(async (session_id: string, forceLoad: boolean = false) => {
    console.log("fetching messages", session_id, "forceLoad:", forceLoad)

    let device_id = deviceId;

    if (!device_id) return;

    const session = sessions.find((s) => s.session_id === session_id);

    // If session already has messages and we're not forcing a load (pagination), skip
    if (!forceLoad && session?.messages?.length > 0) {
      console.log("Session already has messages, skipping fetch");
      return;
    }

    if (messageLoading || !messageHasMore || isFetchingMessageRef.current) {
      console.log("Skipping fetch - loading:", messageLoading, "hasMore:", messageHasMore, "isFetching:", isFetchingMessageRef.current);
      return;
    }

    console.log("Starting to fetch messages...");
    setMessageLoading(true);
    isFetchingMessageRef.current = true;

    try {
      let q = query(
        collection(db, "messages"),
        where("session_id", "==", session_id),
        orderBy("created_at", "desc"),
        limit(MESSAGE_SIZE)
      );

      // Only use lastMessageDoc for pagination (forceLoad = true)
      if (forceLoad && lastMessageDoc) {
        q = query(q, startAfter(lastMessageDoc));
      }

      const snapshot = await getDocs(q);
      const fetchedMessages: Message[] = [];

      snapshot.forEach(doc => {
        fetchedMessages.push({ ...(doc.data() as Message) });
      });

      console.log("Fetched messages:", fetchedMessages.length);

      if (snapshot.docs.length < MESSAGE_SIZE) {
        setMessageHasMore(false);
        console.log("No more messages to load");
      }

      if (snapshot.docs.length > 0) {
        setLastMessageDoc(snapshot.docs[snapshot.docs.length - 1]);
      }

      // Update the session with the new messages
      if (session) {
        let updatedMessages;
        if (forceLoad) {
          // For pagination, append to existing messages
          updatedMessages = [...(session.messages || []), ...fetchedMessages];
        } else {
          // For new session, replace messages
          updatedMessages = fetchedMessages;
        }

        const updatedSession = {
          ...session,
          messages: updatedMessages
        };

        // Update the sessions array with the updated session
        setSessions(prev => prev.map(s =>
          s.session_id === session_id ? updatedSession : s
        ));
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setMessageLoading(false);
      isFetchingMessageRef.current = false;
      console.log("Finished fetching messages");
    }
  }, [deviceId, sessions, messageLoading, messageHasMore, lastMessageDoc]);

  const handleMessageScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const now = Date.now();

    // Throttle scroll events to prevent excessive API calls
    if (now - lastScrollTime < 1000) { // Increased to 1 second
      return; // Ignore scroll events that are too frequent
    }

    console.log("handleMessageScroll triggered", deviceId, "currentSessionId:", activeId);
    if (!deviceId || !activeId) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    console.log("Scroll values:", { scrollTop, scrollHeight, clientHeight, messageHasMore, messageLoading });

    // Check if we're near the bottom (within 50px) and can load more
    if (scrollHeight - scrollTop <= clientHeight + 50 && messageHasMore && !messageLoading) {
      console.log("Loading more messages...");
      setLastScrollTime(now);

      console.log("*******************************Loading more messages...***************************************");
      loadMessages(activeId, true); // forceLoad = true for pagination
    }
  }, [deviceId, activeId, messageHasMore, messageLoading, lastScrollTime, loadMessages]);


  const deleteSession = async (session_id: string, e: React.MouseEvent) => {
    console.log("Deleting session:", session_id)
    const docRef = sessions.find((s) => s.session_id === session_id)?.id;

    console.log("Doc ref:", docRef)

    e.stopPropagation();
    setDeletingSession(session_id);

    try {
      await updateDoc(doc(db, "sessions", docRef), {
        status: "INACTIVE"
      });
      setSessions(prev => prev.filter(s => s.session_id !== session_id)); // remove from UI immediately
      toast.success("Session deleted successfully!");
    } catch (err) {
      console.error("Error marking session inactive:", err);
      toast.error("Failed to delete session. Please try again.");
    } finally {
      setDeletingSession(null);
    }
  };

  const activeSession = useMemo(
    () => {
      const session = sessions.find((s) => s.session_id === activeId) ?? sessions[0];
      console.log("Active session:", session?.session_id, "Total sessions:", sessions.length);
      return session;
    },
    [sessions, activeId]
  );


  useEffect(() => {
    if (isVisible) {
      setTimeout(() => inputRef.current?.focus(), 1000);
    }
  }, [isVisible, activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages?.length, isTyping]);

  async function getDeviceId(): Promise<string> {
    let deviceId = localStorage.getItem("device-id");

    if (deviceId) {
      return deviceId;
    }

    // Create a new device document
    try {
      deviceId = uuidv4()
      localStorage.setItem("device-id", deviceId);
      const docRef = await addDoc(collection(db, "devices"), {
        createdAt: new Date(),
        userAgent: navigator.userAgent,
        device_id: deviceId
      });


    } catch (error) {
      console.error("Error getting device id:", error);
    }


    return deviceId || uuidv4()
  }

  useEffect(() => {
    setInitializing(true);
    getDeviceId().then((id) => {
      console.log("device id", id)
      setDeviceId(id);
      // Reset pagination state when device changes
      setSessions([]);
      setLastSessionDoc(null);
      setSessionHasMore(true);
      setSessionLoading(false);
      fetchSessions(id).finally(() => {
        setInitializing(false);
      });

      // Use this id for session creation or messages
    });
  }, []);


  const createNewSession = async (device_id: string) => {
    setCreatingSession(true);
    try {
      // 1️⃣ Generate a new session
      const session_id = uuidv4();
      const newSessionRef = await addDoc(collection(db, "sessions"), {
        device_id,
        session_id,
        description: "New Chat",
        status: "ACTIVE",
        created_at: new Date(),
      });

      // 2️⃣ Create a welcome message
      const message_id = uuidv4();
      await addDoc(collection(db, "messages"), {
        device_id,
        session_id,
        message_id,
        message:
          "Hi! I'm Vishal's AI assistant. Ask me anything about his experience, projects, or skills!",
        role: "model",
        created_at: new Date(),
      });

      // 3️⃣ Update UI state immediately
      const newSession = {
        device_id,
        session_id,
        description: "New Chat",
        status: "ACTIVE",
        messages: [
          {
            message_id,
            device_id,
            session_id,
            message:
              "Hi! I'm Vishal's AI assistant. Ask me anything about his experience, projects, or skills!",
            role: "model",
            created_at: new Date(),
          },
        ],
        created_at: new Date(),
      };

      setSessions((prev) => [...prev, newSession as ChatSession]);
      setActiveId(session_id); // set new session as active
      toast.success("New session created successfully!");

    } catch (error) {
      console.error("Error creating new session:", error);
      toast.error("Failed to create new session. Please try again.");
    } finally {
      setCreatingSession(false);
    }
  };



  const selectSession = (sessionId: string) => {
    setActiveId(sessionId);
    // Reset message loading state when switching sessions
    setMessageLoading(false);
    setMessageHasMore(true);
    setLastMessageDoc(null);
    isFetchingMessageRef.current = false;
  };

  const renameActiveSessionIfNeeded = (firstUserText: string, active_session_id: string) => {
    // const activeSession = sessions.find((s) => s.id === active_session_id)
    // if (!activeSession || activeSession.title !== "New chat") return;

    // if (!activeSession || activeSession.title !== firstUserText) return;



    // const newTitle = firstUserText || "New chat";
    // setSessions((prev) =>
    //   prev.map((s) =>
    //     s.id === activeSession.id
    //       ? { ...s, title: newTitle, }
    //       : s
    //   )
    // );
  };

  useEffect(() => {
    if (sessions.length > 0) {

      if (activeId) {
        return;
      }

      setActiveId(sessions[0].session_id);
    }
  }, [sessions]);


  useEffect(() => {
    if (activeId) {
      loadMessages(activeId, false);
    }
  }, [activeId, loadMessages]);


  const handleSendMessage = async (e: React.FormEvent) => {

  };


  if (!isVisible) return null;

  return createPortal(
    <div className="fixed bottom-1 right-1 z-[100] isolate">
      {initializing ? (
        <div className="fixed bottom-1 right-1 z-[100] isolate">
          <div className="bg-background/95 backdrop-blur-lg rounded-2xl border gradient-border shadow-2xl shadow-primary/20 flex h-[92vh] w-[98vw] sm:h-[32rem] sm:w-[34rem] md:h-[35rem] md:w-[38rem] lg:h-[38rem] lg:w-[44rem] items-center justify-center">
            <Loader size="md" text="Initializing chat..." />
          </div>
        </div>
      ) :


        <div
          className="bg-background/95 backdrop-blur-lg rounded-2xl border gradient-border shadow-2xl shadow-primary/20 flex
h-[92vh] w-[98vw]
sm:h-[32rem] sm:w-[34rem]
md:h-[35rem] md:w-[38rem]
lg:h-[38rem] lg:w-[44rem]"
          role="dialog"
          aria-label="AI chat assistant"
        >
          {/* Sidebar */}
          <div
            className={`${sidebarOpen ? "w-56 sm:w-64" : "w-0"
              } transition-[width] duration-300 ease-in-out overflow-hidden border-r border-border/50 bg-card/50 backdrop-blur-sm`}
          >
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
                <span className="text-sm font-semibold text-foreground">Chat Sessions</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 hover:bg-primary/20 rounded-full"
                  onClick={() => createNewSession(deviceId)}
                  aria-label="New chat session"
                  disabled={creatingSession}
                >
                  {creatingSession ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Sessions List */}
              <div className="flex-1 px-3 py-3 overflow-y-auto" onScroll={handleSessionScroll} style={{ height: '100%' }}>
                <div className="space-y-2">
                  {sessions.map((session) => {
                    const isActive = session.session_id === activeId;
                    return (
                      <div
                        key={session.session_id}
                        className={`group flex items-center gap-2 rounded-lg px-3 py-3 text-sm cursor-pointer transition-all duration-200 ${deletingSession === session.session_id
                          ? "opacity-50 pointer-events-none"
                          : isActive
                            ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30"
                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          }`}
                        onClick={() => selectSession(session.session_id)}
                      >

                        <MessageSquare className="h-4 w-4 opacity-70 flex-shrink-0" />
                        {/* <span className="flex-1 truncate font-medium" title={session.title}>
                        {session.title}
                      </span> */}

                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <span className="flex-1 truncate font-medium cursor-default">
                              {session.description.length > 20 ? session.description.slice(0, 20) + "..." : session.description}
                            </span>
                          </Tooltip.Trigger>

                          <Tooltip.Portal>
                            <Tooltip.Content
                              side="top"
                              sideOffset={5}
                              className="bg-black text-white text-xs rounded px-2 py-1 z-[99999] shadow-lg max-w-xs break-words whitespace-normal pointer-events-none"
                            >
                              {session.description}
                              <Tooltip.Arrow className="fill-black" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>

                        {sessions.length > 1 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all duration-200"
                            onClick={(e) => deleteSession(session.session_id, e)}
                            aria-label="Delete session"
                            disabled={deletingSession === session.session_id}
                          >
                            {deletingSession === session.session_id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        )}

                      </div>
                    );
                  })}



                  {sessionLoading && (
                    <div className="flex justify-center py-4">
                      <Loader size="sm" text="Loading sessions..." />
                    </div>
                  )}

                  {!sessionHasMore && sessions.length > 0 && (
                    <div className="flex justify-center py-4">
                      <span className="text-xs text-muted-foreground">No more sessions</span>
                    </div>
                  )}

                  {sessionHasMore && !sessionLoading && sessions.length > 0 && (
                    <div className="flex justify-center py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSessions(deviceId)}
                        className="text-xs"
                        disabled={sessionLoading}
                      >
                        {sessionLoading ? (
                          <Loader size="xs" text="Loading..." />
                        ) : (
                          "Load More Sessions"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main chat area */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5 relative z-10">
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 hover:bg-primary/20 rounded-full transition-all duration-200"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                  {sidebarOpen ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate text-foreground">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground truncate">Ask me about Vishal</p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">




                <Button
                  onClick={(e) => {
                    console.log('Close button clicked');
                    e.stopPropagation();
                    onToggle();
                  }}
                  size="icon"
                  variant="outline"
                  aria-label={isVisible ? "Close chat" : "Open chat"}
                  className="h-10 w-10 rounded-full gradient-border bg-background/90 backdrop-blur-md  transition-all duration-300 group hover:scale-110"
                >

                  <X size={20} className="text-primary transition-transform group-hover:rotate-90" />

                </Button>
              </div>
            </div>

            {/* Messages Area */}
            {/* <ScrollArea className="flex-1 px-4 py-4" onScroll={handleMessageScroll}>
              <div className="space-y-4">
                {activeSession?.messages?.map((message) => (
                  <div
                    key={message.message_id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role !== "user" && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                        <Bot size={14} className="text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${message.role === "user"
                        ? "bg-gradient-to-r from-primary to-accent text-white ml-auto shadow-lg"
                        : "bg-muted/70 text-foreground border border-border/50"
                        }`}
                    >
                      <div className="prose prose-sm text-foreground break-words">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeSanitize]}
                        >
                          {message.message}
                        </ReactMarkdown>
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                        <User size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-muted/70 p-3 rounded-2xl border border-border/50">
                      <div className="flex gap-1 items-end">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea> */}

            <ScrollArea className="flex-1 px-4 py-4" onScroll={handleMessageScroll}>
              <div className="space-y-4">
                {activeSession?.messages?.map((message) => (
                  <div
                    key={message.message_id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role !== "user" && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                        <Bot size={14} className="text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${message.role === "user"
                        ? "bg-gradient-to-r from-primary to-accent text-white ml-auto shadow-lg"
                        : "bg-muted/70 text-foreground border border-border/50"
                        }`}
                    >
                      <div className="prose prose-sm text-foreground break-words">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeSanitize]}
                        >
                          {message.message}
                        </ReactMarkdown>
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                        <User size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-muted/70 p-3 rounded-2xl border border-border/50">
                      <div className="flex gap-1 items-end">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loader at the bottom for loading more messages */}
                {messageLoading && messageHasMore && (
                  <div className="flex justify-center py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm">Loading more messages...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="px-4 pb-4 pt-3 border-t border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about Vishal..."
                  className="flex-1 bg-background/80 border-border/50 focus:border-primary rounded-full px-4 py-2 text-sm placeholder:text-muted-foreground/70 transition-all duration-200"
                  aria-label="Message input"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl h-10 w-10"
                  aria-label="Send message"
                  disabled={!inputMessage.trim() || isTyping}
                >
                  <Send size={16} />
                </Button>
              </div>
            </form>
          </div>
        </div>
      }


    </div>,
    document.body

  )
}

