import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentationSidebar, getDocFile } from "./DocumentationSidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import "highlight.js/styles/github-dark.css";

export const DocumentationViewer = () => {
  const [activeDoc, setActiveDoc] = useState("readme");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const fileName = getDocFile(activeDoc);
        const response = await fetch(`/DOCS/${fileName}`);
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar documento: ${response.status}`);
        }
        
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setContent("");
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [activeDoc]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <Card className="lg:col-span-1">
        <CardContent className="p-4">
          <DocumentationSidebar activeDoc={activeDoc} onSelectDoc={setActiveDoc} />
        </CardContent>
      </Card>

      {/* Content Viewer */}
      <Card className="lg:col-span-3">
        <CardContent className="p-6 md:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <article className="prose max-w-none dark:prose-invert
              prose-headings:font-outfit prose-headings:font-bold prose-headings:text-foreground
              prose-h1:text-3xl prose-h1:mb-4
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-muted-foreground prose-p:leading-7
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-[#002038] prose-pre:text-background
              prose-table:border prose-table:border-border
              prose-th:bg-muted prose-th:p-2 prose-th:border prose-th:border-border
              prose-td:p-2 prose-td:border prose-td:border-border
              prose-li:text-muted-foreground
              prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
              prose-strong:text-foreground prose-strong:font-semibold
            ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  // Custom rendering for mermaid diagrams
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isMermaid = match && match[1] === 'mermaid';
                    
                    if (isMermaid) {
                      return (
                        <div className="bg-muted p-4 rounded-lg my-4 overflow-x-auto">
                          <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {children}
                          </pre>
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            ℹ️ Diagrama Mermaid - Visualização disponível em ferramentas de Markdown
                          </p>
                        </div>
                      );
                    }

                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
