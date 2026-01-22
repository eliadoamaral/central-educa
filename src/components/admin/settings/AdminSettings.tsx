import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentationViewer } from "./DocumentationViewer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Settings, Shield } from "lucide-react";

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("documentation");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Documentação</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documentation" className="mt-6">
          <DocumentationViewer />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Gerencie as configurações gerais da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Em breve: configurações de notificações, integrações e personalização.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>
                Políticas de acesso e logs de segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Em breve: políticas RLS, logs de segurança e configurações de autenticação.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
