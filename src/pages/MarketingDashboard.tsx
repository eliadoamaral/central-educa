import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Megaphone, TrendingUp, Target, BarChart3, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageView } from "@/hooks/usePageView";
import { useStudents } from "@/hooks/useStudents";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart } from "recharts";
const leadSources = [{
  value: "indicacao",
  label: "Indicação",
  color: "hsl(var(--chart-1))"
}, {
  value: "evento",
  label: "Evento",
  color: "hsl(var(--chart-2))"
}, {
  value: "redes_sociais",
  label: "Redes Sociais",
  color: "hsl(var(--chart-3))"
}, {
  value: "google",
  label: "Google/Busca",
  color: "hsl(var(--chart-4))"
}, {
  value: "linkedin",
  label: "LinkedIn",
  color: "hsl(var(--chart-5))"
}, {
  value: "instagram",
  label: "Instagram",
  color: "hsl(142, 76%, 36%)"
}, {
  value: "youtube",
  label: "YouTube",
  color: "hsl(0, 84%, 60%)"
}, {
  value: "email_marketing",
  label: "Email Marketing",
  color: "hsl(262, 83%, 58%)"
}, {
  value: "parceiro",
  label: "Parceiro/Afiliado",
  color: "hsl(25, 95%, 53%)"
}, {
  value: "outro",
  label: "Outro",
  color: "hsl(var(--muted-foreground))"
}];
const leadSourceLabels: Record<string, string> = leadSources.reduce((acc, source) => {
  acc[source.value] = source.label;
  return acc;
}, {} as Record<string, string>);
const leadSourceColors: Record<string, string> = leadSources.reduce((acc, source) => {
  acc[source.value] = source.color;
  return acc;
}, {} as Record<string, string>);
const courses = ["Sucessores do Agro", "Gestoras do Agro", "Reforma Tributária", "Gestão Estratégica de Pessoas"];
export default function MarketingDashboard() {
  usePageView('/marketing');
  const navigate = useNavigate();
  const {
    students,
    loading
  } = useStudents();
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      if (courseFilter !== "all" && student.course !== courseFilter) return false;
      if (statusFilter !== "all" && student.status !== statusFilter) return false;
      return true;
    });
  }, [students, courseFilter, statusFilter]);

  // Calculate metrics by lead source
  const sourceMetrics = useMemo(() => {
    const metrics: Record<string, {
      total: number;
      active: number;
      graduated: number;
      dropped: number;
      scClients: number;
    }> = {};
    filteredStudents.forEach(student => {
      const source = student.lead_source || "nao_informado";
      if (!metrics[source]) {
        metrics[source] = {
          total: 0,
          active: 0,
          graduated: 0,
          dropped: 0,
          scClients: 0
        };
      }
      metrics[source].total++;
      if (student.status === "active") metrics[source].active++;
      if (student.status === "graduated") metrics[source].graduated++;
      if (student.status === "dropped") metrics[source].dropped++;
      if (student.is_sc_client) metrics[source].scClients++;
    });
    return metrics;
  }, [filteredStudents]);

  // Bar chart data - leads by source
  const barChartData = useMemo(() => {
    return Object.entries(sourceMetrics).map(([source, data]) => ({
      source: leadSourceLabels[source] || "Não informado",
      sourceKey: source,
      total: data.total,
      active: data.active,
      graduated: data.graduated,
      dropped: data.dropped,
      conversionRate: data.total > 0 ? Math.round(data.graduated / data.total * 100) : 0
    })).sort((a, b) => b.total - a.total);
  }, [sourceMetrics]);

  // Pie chart data - distribution
  const pieChartData = useMemo(() => {
    return Object.entries(sourceMetrics).filter(([_, data]) => data.total > 0).map(([source, data]) => ({
      name: leadSourceLabels[source] || "Não informado",
      value: data.total,
      color: leadSourceColors[source] || "hsl(var(--muted-foreground))"
    })).sort((a, b) => b.value - a.value);
  }, [sourceMetrics]);

  // Conversion rate data
  const conversionData = useMemo(() => {
    return Object.entries(sourceMetrics).filter(([_, data]) => data.total >= 3) // Only show sources with at least 3 leads
    .map(([source, data]) => ({
      source: leadSourceLabels[source] || "Não informado",
      sourceKey: source,
      conversionRate: data.total > 0 ? Math.round(data.graduated / data.total * 100) : 0,
      retentionRate: data.total > 0 ? Math.round((data.active + data.graduated) / data.total * 100) : 0,
      dropRate: data.total > 0 ? Math.round(data.dropped / data.total * 100) : 0,
      total: data.total
    })).sort((a, b) => b.conversionRate - a.conversionRate);
  }, [sourceMetrics]);

  // Overall metrics
  const overallMetrics = useMemo(() => {
    const total = filteredStudents.length;
    const withSource = filteredStudents.filter(s => s.lead_source).length;
    const graduated = filteredStudents.filter(s => s.status === "graduated").length;
    const active = filteredStudents.filter(s => s.status === "active").length;
    const dropped = filteredStudents.filter(s => s.status === "dropped").length;
    const scClients = filteredStudents.filter(s => s.is_sc_client).length;

    // Best performing source
    let bestSource = {
      source: "",
      rate: 0
    };
    conversionData.forEach(item => {
      if (item.conversionRate > bestSource.rate) {
        bestSource = {
          source: item.source,
          rate: item.conversionRate
        };
      }
    });
    return {
      total,
      withSource,
      withoutSource: total - withSource,
      sourcePercentage: total > 0 ? Math.round(withSource / total * 100) : 0,
      conversionRate: total > 0 ? Math.round(graduated / total * 100) : 0,
      retentionRate: total > 0 ? Math.round((active + graduated) / total * 100) : 0,
      dropRate: total > 0 ? Math.round(dropped / total * 100) : 0,
      scConversionRate: total > 0 ? Math.round(scClients / total * 100) : 0,
      bestSource
    };
  }, [filteredStudents, conversionData]);

  // S&C client conversion by source
  const scClientsBySource = useMemo(() => {
    return Object.entries(sourceMetrics).filter(([_, data]) => data.total >= 2).map(([source, data]) => ({
      source: leadSourceLabels[source] || "Não informado",
      sourceKey: source,
      scClients: data.scClients,
      total: data.total,
      scRate: data.total > 0 ? Math.round(data.scClients / data.total * 100) : 0
    })).sort((a, b) => b.scRate - a.scRate);
  }, [sourceMetrics]);
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Dashboard de Marketing</h1>
                  <p className="text-sm text-muted-foreground">Análise de conversão por origem de lead</p>
                </div>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos os cursos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os cursos</SelectItem>
                  {courses.map(course => <SelectItem key={course} value={course}>{course}</SelectItem>)}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="graduated">Formados</SelectItem>
                  <SelectItem value="dropped">Desistentes</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-transparent shadow-soft hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-[2000ms] ease-in-out cursor-default group">
            <CardContent className="p-4">
              <p className="text-muted-foreground font-medium mb-2 group-hover:text-primary/70 transition-colors duration-[2000ms] text-sm">Total de Leads</p>
              <span className="text-2xl font-bold font-outfit text-foreground group-hover:text-primary transition-colors duration-[2000ms]">
                {overallMetrics.total}
              </span>
              <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary/60 transition-colors duration-[2000ms]">
                {overallMetrics.withSource} com origem ({overallMetrics.sourcePercentage}%)
              </p>
            </CardContent>
          </Card>

          <Card className="border border-transparent shadow-soft hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-[2000ms] ease-in-out cursor-default group">
            <CardContent className="p-4">
              <p className="text-muted-foreground font-medium mb-2 group-hover:text-primary/70 transition-colors duration-[2000ms] text-sm">Taxa de Conversão</p>
              <span className="text-2xl font-bold font-outfit text-foreground group-hover:text-primary transition-colors duration-[2000ms]">
                {overallMetrics.conversionRate}%
              </span>
              <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary/60 transition-colors duration-[2000ms]">
                Leads que se formaram
              </p>
            </CardContent>
          </Card>

          <Card className="border border-transparent shadow-soft hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-[2000ms] ease-in-out cursor-default group">
            <CardContent className="p-4">
              <p className="text-muted-foreground font-medium mb-2 group-hover:text-primary/70 transition-colors duration-[2000ms] text-sm">Taxa de Retenção</p>
              <span className="text-2xl font-bold font-outfit text-foreground group-hover:text-primary transition-colors duration-[2000ms]">
                {overallMetrics.retentionRate}%
              </span>
              <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary/60 transition-colors duration-[2000ms]">
                Ativos + Formados
              </p>
            </CardContent>
          </Card>

          <Card className="border border-transparent shadow-soft hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-[2000ms] ease-in-out cursor-default group">
            <CardContent className="p-4">
              <p className="text-muted-foreground font-medium mb-2 group-hover:text-primary/70 transition-colors duration-[2000ms] text-sm">Melhor Canal</p>
              <span className="text-2xl font-bold font-outfit text-foreground group-hover:text-primary transition-colors duration-[2000ms] truncate block">
                {overallMetrics.bestSource.source || "N/A"}
              </span>
              <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary/60 transition-colors duration-[2000ms]">
                {overallMetrics.bestSource.rate}% de conversão
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Leads by Source */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Leads por Origem
              </CardTitle>
              <CardDescription>Distribuição de alunos por canal de aquisição</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} layout="vertical" margin={{
                  left: 20,
                  right: 20
                }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{
                    fontSize: 12
                  }} className="text-muted-foreground" />
                    <YAxis dataKey="source" type="category" width={100} tick={{
                    fontSize: 11
                  }} className="text-muted-foreground" />
                    <Tooltip contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} formatter={(value: number, name: string) => [value, name === 'total' ? 'Total' : name]} />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart - Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Distribuição por Canal
              </CardTitle>
              <CardDescription>Proporção de leads por origem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({
                    name,
                    percent
                  }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                      {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Rate Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Taxa de Conversão por Canal
            </CardTitle>
            <CardDescription>Análise de performance de cada origem (mínimo 3 leads)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionData} margin={{
                left: 20,
                right: 20,
                bottom: 20
              }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="source" tick={{
                  fontSize: 11
                }} angle={-45} textAnchor="end" height={80} className="text-muted-foreground" />
                  <YAxis tick={{
                  fontSize: 12
                }} domain={[0, 100]} tickFormatter={value => `${value}%`} className="text-muted-foreground" />
                  <Tooltip contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    conversionRate: 'Conversão',
                    retentionRate: 'Retenção',
                    dropRate: 'Desistência'
                  };
                  return [`${value}%`, labels[name] || name];
                }} />
                  <Legend formatter={value => {
                  const labels: Record<string, string> = {
                    conversionRate: 'Conversão',
                    retentionRate: 'Retenção',
                    dropRate: 'Desistência'
                  };
                  return labels[value] || value;
                }} />
                  <Bar dataKey="conversionRate" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="retentionRate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="dropRate" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento por Origem</CardTitle>
            <CardDescription>Métricas detalhadas de cada canal de aquisição</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Origem</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Ativos</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Formados</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Desistentes</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Conversão</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Clientes S&C</th>
                  </tr>
                </thead>
                <tbody>
                  {barChartData.map((row, index) => {
                  const sourceData = sourceMetrics[row.sourceKey];
                  const scRate = sourceData && sourceData.total > 0 ? Math.round(sourceData.scClients / sourceData.total * 100) : 0;
                  return <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{
                          backgroundColor: leadSourceColors[row.sourceKey] || 'hsl(var(--muted-foreground))'
                        }} />
                            <span className="font-medium text-foreground">{row.source}</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4 font-semibold text-foreground">{row.total}</td>
                        <td className="text-center py-3 px-4">
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                            {row.active}
                          </Badge>
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                            {row.graduated}
                          </Badge>
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                            {row.dropped}
                          </Badge>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <span className={`font-semibold ${row.conversionRate >= 50 ? 'text-green-600' : row.conversionRate >= 25 ? 'text-amber-600' : 'text-red-600'}`}>
                              {row.conversionRate}%
                            </span>
                            {row.conversionRate >= 50 ? <ArrowUpRight className="h-4 w-4 text-green-600" /> : row.conversionRate < 25 ? <ArrowDownRight className="h-4 w-4 text-red-600" /> : null}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-muted-foreground">
                            {sourceData?.scClients || 0} ({scRate}%)
                          </span>
                        </td>
                      </tr>;
                })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* S&C Client Analysis */}
        {scClientsBySource.length > 0 && <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Conversão para Cliente S&C por Origem
              </CardTitle>
              <CardDescription>Quais canais geram mais clientes da consultoria (mínimo 2 leads)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scClientsBySource} margin={{
                left: 20,
                right: 20,
                bottom: 20
              }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="source" tick={{
                  fontSize: 11
                }} angle={-45} textAnchor="end" height={80} className="text-muted-foreground" />
                    <YAxis tick={{
                  fontSize: 12
                }} domain={[0, 100]} tickFormatter={value => `${value}%`} className="text-muted-foreground" />
                    <Tooltip contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} formatter={(value: number, name: string) => {
                  if (name === 'scRate') return [`${value}%`, 'Taxa S&C'];
                  return [value, name];
                }} />
                    <Area type="monotone" dataKey="scRate" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>}
      </main>
    </div>;
}