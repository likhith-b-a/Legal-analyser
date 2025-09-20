import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import {
  FileText,
  MessageSquare,
  Shield,
  BarChart3,
  Moon,
  Sun,
  Scale,
} from "lucide-react";
import { DocumentUpload } from "./components/document-upload";
import { QAMode } from "./components/qa-mode";
import { UnifiedAnalysis } from "./components/unified-analysis";
import { ChatAssistant } from "./components/chat-assistant";
import { ThemeProvider } from "./components/ThemeProvider";


export default function LegalAnalyzer() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("legal-analyzer-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const shouldUseDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setDarkMode(shouldUseDark);
    if (shouldUseDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    localStorage.setItem(
      "legal-analyzer-theme",
      newDarkMode ? "dark" : "light"
    );
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  return (
      <ThemeProvider>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
          <div className="w-full max-w-md mx-auto p-4 space-y-4">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Scale className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Legal Analyzer</h1>
                  <p className="text-xs text-muted-foreground">
                    AI-Powered Document Analysis
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="h-9 w-9 p-0 hover:bg-muted/50 transition-colors"
                title={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600" />
                )}
              </Button>
            </div>

            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50">
                <TabsTrigger
                  value="qa"
                  className="text-xs flex flex-col gap-1 h-10"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Q&A</span>
                </TabsTrigger>
                <TabsTrigger
                  value="analyze"
                  className="text-xs flex flex-col gap-1 h-10"
                >
                  <BarChart3 className="h-3 w-3" />
                  <span>Analyze</span>
                </TabsTrigger>
                <TabsTrigger
                  value="chat"
                  className="text-xs flex flex-col gap-1 h-10"
                >
                  <Shield className="h-3 w-3" />
                  <span>Chat</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4 mt-4">
                <DocumentUpload />
              </TabsContent>

              <TabsContent value="qa" className="space-y-4 mt-4">
                <QAMode />
              </TabsContent>

              <TabsContent value="analyze" className="space-y-4 mt-4">
                <UnifiedAnalysis />
              </TabsContent>

              <TabsContent value="chat" className="space-y-4 mt-4">
                <ChatAssistant />
              </TabsContent>
            </Tabs>

            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Secure • Private • AI-Powered Legal Analysis
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max file size: 10MB • PDF documents only
              </p>
            </div>
          </div>
        </div>
      </ThemeProvider>
  );
}
