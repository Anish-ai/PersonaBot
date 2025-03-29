"use client"
import { useState, useEffect } from "react"
import { BrainCircuit, FileText, Moon, Sun, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useSessionStore } from "@/lib/store"

export default function InsightsPage() {
  const [darkMode, setDarkMode] = useState(true)
  const { extractedData, analysis } = useSessionStore()

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-black text-gray-300 transition-colors duration-300">
      <div className="container mx-auto p-4 py-6">
        <header className="mb-6 flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-100">PersonaBot</h1>
            <p className="text-gray-400 text-sm md:text-base mt-1">Session Insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-gray-700 bg-gray-900 hover:bg-gray-800 hover:text-gray-100"
              >
                <ArrowLeft className="h-4 w-4 text-gray-300" />
                <span>Back to Chat</span>
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

        <Card className="border-0 shadow-md bg-gray-900 border-gray-800 overflow-hidden h-[calc(100vh-9rem)]">
          <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-800 py-3">
            <CardTitle className="flex items-center text-lg text-gray-200">
              <BrainCircuit className="mr-2 h-5 w-5 text-gray-400" />
              Session Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-3.5rem)]">
            <div className="h-full">
              <DataDisplay extractedData={extractedData} analysis={analysis} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// DataDisplay component
const DataDisplay = ({ 
  extractedData, 
  analysis 
}: { 
  extractedData: Record<string, string | string[]>;
  analysis: {
    mentalHealthProfile?: string;
    keyTraits?: string;
    supportStrategies?: string;
    informationGaps?: string;
    summary?: string;
  } | null;
}) => {
  const hasData = Object.keys(extractedData).length > 0
  const hasAnalysis = analysis !== null && Object.keys(analysis).some((key) => Boolean(analysis[key as keyof typeof analysis]))

  if (!hasData && !hasAnalysis) {
    return (
      <div className="h-full flex items-center justify-center text-center p-6 md:p-8">
        <div className="max-w-md">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-200 mb-2">No data collected yet</h3>
          <p className="text-sm text-gray-400">
            Return to the chat and continue your conversation to generate insights.
          </p>
          <div className="mt-6">
            <Link href="/">
              <Button
                variant="outline"
                className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
              >
                Return to Chat
              </Button>
            </Link>
          </div>
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

      <ScrollArea className="h-[calc(100%-3.5rem)] p-3 md:p-4">
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