import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import CursoSucessoresAgro from "./pages/CursoSucessoresAgro";
import CursoGestorasAgro from "./pages/CursoGestorasAgro";
import MapeamentoPerfil from "./pages/MapeamentoPerfil";
import MapeamentoPerfilGestoras from "./pages/MapeamentoPerfilGestoras";
import PesquisaSatisfacao from "./pages/PesquisaSatisfacao";
import ResultadoFinanceiro from "./pages/ResultadoFinanceiro";
import Perfil from "./pages/Perfil";
import Alunos from "./pages/Alunos";
import AlunoDetalhes from "./pages/AlunoDetalhes";
import MarketingDashboard from "./pages/MarketingDashboard";
import Prospeccao from "./pages/Prospeccao";
import NotFound from "./pages/NotFound";
import DesignSystem from "./pages/DesignSystem";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Routes that require full access (admin or user role) */}
              <Route path="/" element={<ProtectedRoute requireFullAccess><Index /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireFullAccess><AdminDashboard /></ProtectedRoute>} />
              <Route path="/alunos" element={<ProtectedRoute requireFullAccess><Alunos /></ProtectedRoute>} />
              <Route path="/alunos/:id" element={<ProtectedRoute requireFullAccess><AlunoDetalhes /></ProtectedRoute>} />
              <Route path="/marketing" element={<ProtectedRoute requireFullAccess><MarketingDashboard /></ProtectedRoute>} />
              <Route path="/prospeccao" element={<ProtectedRoute requireFullAccess><Prospeccao /></ProtectedRoute>} />
              <Route path="/design-system" element={<ProtectedRoute requireFullAccess><DesignSystem /></ProtectedRoute>} />
              
              {/* Dashboard routes - Mapeamento de Perfil allowed for viewers */}
              <Route path="/mapeamento-de-perfil" element={<ProtectedRoute><MapeamentoPerfil /></ProtectedRoute>} />
              <Route path="/gestoras-do-agro/mapeamento-perfil" element={<ProtectedRoute><MapeamentoPerfilGestoras /></ProtectedRoute>} />
              
              {/* Dashboard routes that require full access */}
              <Route path="/pesquisa-de-satisfacao" element={<ProtectedRoute requireFullAccess><PesquisaSatisfacao /></ProtectedRoute>} />
              <Route path="/sucessores-do-agro/resultado-financeiro" element={<ProtectedRoute requireFullAccess><ResultadoFinanceiro /></ProtectedRoute>} />
              
              {/* Course pages - allowed for viewers */}
              <Route path="/sucessores-do-agro" element={<ProtectedRoute><CursoSucessoresAgro /></ProtectedRoute>} />
              <Route path="/gestoras-do-agro" element={<ProtectedRoute><CursoGestorasAgro /></ProtectedRoute>} />
              
              {/* Profile - allowed for viewers */}
              <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
