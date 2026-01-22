import GestorasAgroDashboard from "@/components/dashboard/GestorasAgroDashboard";
import { usePageView } from "@/hooks/usePageView";

const MapeamentoPerfilGestoras = () => {
  usePageView("/gestoras-do-agro/mapeamento-perfil");

  return <GestorasAgroDashboard />;
};

export default MapeamentoPerfilGestoras;
