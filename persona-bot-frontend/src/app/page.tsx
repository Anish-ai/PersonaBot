"use client"
import { useState, useRef, useEffect } from "react"
import { Send, Loader2, User, Bot, Moon, Sun, BrainCircuit } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toast } from "@/components/ui/toast"
import { useSessionStore } from "@/lib/store"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export default function CounselorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Get store methods
  const { extractedData, updateExtractedData, updateAnalysis } = useSessionStore()

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          history: messages,
          extracted_data: extractedData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Request failed with status ${response.status}`)
      }

      const data = await response.json()

      const botMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, botMessage])

      if (data.extractedData) {
        updateExtractedData(data.extractedData)
      }

      if (data.analysis) {
        updateAnalysis(data.analysis)
      }
    } catch (error) {
      console.error("API Error:", error)

      const errorMessage = error instanceof Error ? error.message : "Failed to process message"

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage.includes("Failed to fetch")
            ? "Could not connect to the server. Please check your connection."
            : errorMessage,
          timestamp: new Date().toISOString(),
        },
      ])

      Toast({
        title: "Error",
        content: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 transition-colors duration-300">
      <div className="container mx-auto p-4 py-6">
        <header className="mb-6 flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-100">PersonaBot</h1>
            <p className="text-gray-400 text-sm md:text-base mt-1">A safe space to talk and receive guidance</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/insights">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-gray-700 bg-gray-900 hover:bg-gray-800 hover:text-gray-100"
              >
                <BrainCircuit className="h-4 w-4 text-gray-300" />
                <span>Insights</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full border-gray-700 bg-gray-900 hover:bg-gray-800 hover:text-gray-100"
            >
              {darkMode ? <Sun className="h-5 w-5 text-gray-300" /> : <Moon className="h-5 w-5 text-gray-300" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </header>

        <div className="mx-auto max-w-4xl h-[calc(100vh-9rem)]">
          {/* Chat Container */}
          <Card className="border-0 shadow-md bg-gray-900 border-gray-800 h-full flex flex-col">
            <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800 py-3">
              <CardTitle className="flex items-center text-lg text-gray-200">
                <Bot className="mr-2 h-5 w-5 text-gray-400" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 w-full">
                <div className="p-3 md:p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="min-h-[300px] flex items-center justify-center text-center p-6">
                      <div className="max-w-md">
                        <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                          <Bot className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-200 mb-2">Welcome to your session</h3>
                        <p className="text-sm text-gray-400">
                          Share how you're feeling today, and I'll be here to listen and provide support.
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`flex gap-2 max-w-[90%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                              msg.role === "user" ? "bg-gray-700 text-gray-300" : "bg-gray-800 text-gray-300"
                            }`}
                          >
                            {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                          </div>
                          <div
                            className={`rounded-2xl px-4 py-3 ${
                              msg.role === "user" ? "bg-gray-700 text-gray-100" : "bg-gray-800 text-gray-200"
                            }`}
                          >
                            <p className="text-sm md:text-base">{msg.content}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="p-3 md:p-4 border-t border-gray-800 bg-gray-900">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type your message here..."
                    className="flex-1 bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 focus-visible:ring-gray-600"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading}
                    className="gap-1 bg-gray-700 hover:bg-gray-600 text-gray-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="sr-only md:not-sr-only md:inline-flex">Sending</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:inline-flex">Send</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

