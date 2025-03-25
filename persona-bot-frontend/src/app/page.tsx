"use client"
import { useState, useRef, useEffect } from "react"
import { Send, Loader2, User, Bot, Moon, Sun, BrainCircuit, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Toast } from "@/components/ui/toast"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface ExtractedData {
  [key: string]: string | string[]
}

interface Analysis {
  mentalHealthProfile?: string
  keyTraits?: string
  supportStrategies?: string
  informationGaps?: string
  summary?: string
}

export default function CounselorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [extractedData, setExtractedData] = useState<ExtractedData>({})
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
        setExtractedData((prev) => ({ ...prev, ...data.extractedData }))
      }

      if (data.analysis) {
        setAnalysis((prev) => ({
          ...(prev || {}),
          ...data.analysis,
        }))
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full border-gray-700 bg-gray-900 hover:bg-gray-800 hover:text-gray-100"
          >
            {darkMode ? <Sun className="h-5 w-5 text-gray-300" /> : <Moon className="h-5 w-5 text-gray-300" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Chat Container */}
          <Card className="lg:col-span-2 border-0 shadow-md bg-gray-900 border-gray-800 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800 py-3">
              <CardTitle className="flex items-center text-lg text-gray-200">
                <Bot className="mr-2 h-5 w-5 text-gray-400" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col h-[calc(100vh-16rem)] md:h-[600px]">
                <ScrollArea className="flex-1 p-3 md:p-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-6 md:p-8">
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
                    <div className="space-y-4">
                      {messages.map((msg, index) => (
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
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
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
              </div>
            </CardContent>
          </Card>

          {/* Data Display */}
          <Card className="border-0 shadow-md bg-gray-900 border-gray-800 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-800 py-3">
              <CardTitle className="flex items-center text-lg text-gray-200">
                <BrainCircuit className="mr-2 h-5 w-5 text-gray-400" />
                Session Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[calc(100vh-16rem)] md:h-[600px]">
                <DataDisplay extractedData={extractedData} analysis={analysis} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// DataDisplay component
const DataDisplay = ({ extractedData, analysis }: { extractedData: ExtractedData; analysis: Analysis | null }) => {
  const hasData = Object.keys(extractedData).length > 0
  const hasAnalysis = analysis !== null && Object.keys(analysis).some((key) => Boolean(analysis[key as keyof Analysis]))

  if (!hasData && !hasAnalysis) {
    return (
      <div className="h-full flex items-center justify-center text-center p-6 md:p-8">
        <div className="max-w-md">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-200 mb-2">No data collected yet</h3>
          <p className="text-sm text-gray-400">As you chat, important information and insights will appear here.</p>
        </div>
      </div>
    )
  }

  return (
    <Tabs defaultValue={hasAnalysis ? "analysis" : "data"} className="w-full">
      <div className="px-3 md:px-4 pt-3 md:pt-4">
        <TabsList className="w-full bg-gray-800">
          <TabsTrigger
            value="data"
            className="flex-1 data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-gray-100"
            disabled={!hasData}
          >
            Information
            {hasData && (
              <Badge variant="outline" className="ml-2 text-xs bg-gray-700 text-gray-300 border-gray-600">
                {Object.keys(extractedData).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            className="flex-1 data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-gray-100"
            disabled={!hasAnalysis}
          >
            Analysis
          </TabsTrigger>
        </TabsList>
      </div>

      <ScrollArea className="h-[calc(100vh-20rem)] md:h-[540px] p-3 md:p-4">
        <TabsContent value="data" className="mt-0">
          {hasData ? (
            <div className="space-y-3">
              {Object.entries(extractedData).map(([key, value]) => (
                <div key={key} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h3 className="font-medium text-gray-200 capitalize">{key}</h3>
                  <p className="text-gray-400 text-sm mt-1">{Array.isArray(value) ? value.join(", ") : value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500">No information collected yet.</div>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="mt-0">
          {hasAnalysis ? (
            <div className="space-y-3">
              {analysis?.mentalHealthProfile && (
                <AnalysisSection title="Mental Health Profile" content={analysis.mentalHealthProfile} />
              )}
              {analysis?.keyTraits && <AnalysisSection title="Key Personality Traits" content={analysis.keyTraits} />}
              {analysis?.supportStrategies && (
                <AnalysisSection title="Support Strategies" content={analysis.supportStrategies} />
              )}
              {analysis?.informationGaps && (
                <AnalysisSection title="Information Gaps" content={analysis.informationGaps} />
              )}
              {analysis?.summary && (
                <>
                  <Separator className="my-4 bg-gray-700" />
                  <AnalysisSection title="Summary" content={analysis.summary} />
                </>
              )}
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500">Analysis will appear after sufficient conversation.</div>
          )}
        </TabsContent>
      </ScrollArea>
    </Tabs>
  )
}

// Helper component for analysis sections
const AnalysisSection = ({ title, content }: { title: string; content: string }) => (
  <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
    <h3 className="font-medium text-gray-200 mb-2">{title}</h3>
    <p className="text-gray-400 text-sm whitespace-pre-wrap">{content}</p>
  </div>
)

