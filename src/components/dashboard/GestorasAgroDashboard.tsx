import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import educasafrasLogo from "@/assets/educasafras-sem-fundo.png";
import { GestorasOverviewCards } from "./GestorasOverviewCards";
import { GestorasBrazilMap } from "./GestorasBrazilMap";
import { DonutChart } from "./DonutChart";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { RatingScaleCard } from "./RatingScaleCard";
import { SuggestedTopicsCard } from "./SuggestedTopicsCard";
import { ChartData, ParticipantData } from "@/types/dashboard";
import { DimensionRating } from "@/types/satisfaction";
const GestorasAgroDashboard = () => {
  const navigate = useNavigate();

  // Dados de distribuição por estado
  const stateData: {
    name: string;
    value: number;
  }[] = [{
    name: "GO",
    value: 28
  }, {
    name: "MS",
    value: 21
  }, {
    name: "MG",
    value: 6
  }, {
    name: "MT",
    value: 5
  }, {
    name: "PR",
    value: 4
  }, {
    name: "SP",
    value: 3
  }, {
    name: "TO",
    value: 2
  }, {
    name: "PI",
    value: 2
  }, {
    name: "BA",
    value: 1
  }, {
    name: "CE",
    value: 1
  }, {
    name: "PA",
    value: 1
  }, {
    name: "DF",
    value: 1
  }];
  const cityData: {
    name: string;
    value: number;
  }[] = [{
    name: "Goiânia",
    value: 10
  }, {
    name: "São Gabriel do Oeste",
    value: 10
  }, {
    name: "Chapadão do Sul",
    value: 9
  }, {
    name: "Jataí",
    value: 7
  }, {
    name: "Rio Verde",
    value: 4
  }, {
    name: "Unaí",
    value: 4
  }, {
    name: "Sidrolândia",
    value: 2
  }, {
    name: "São Paulo",
    value: 2
  }, {
    name: "Palmas",
    value: 2
  }, {
    name: "Formosa",
    value: 2
  }, {
    name: "Guarapuava",
    value: 2
  }, {
    name: "Teresina",
    value: 1
  }, {
    name: "Castro",
    value: 1
  }, {
    name: "Caiapônia",
    value: 1
  }, {
    name: "Sinop",
    value: 1
  }, {
    name: "Campo Verde",
    value: 1
  }, {
    name: "Ituiutaba",
    value: 1
  }, {
    name: "Nova Mutum",
    value: 1
  }, {
    name: "Luís Eduardo Magalhães",
    value: 1
  }, {
    name: "Bom Jesus",
    value: 1
  }, {
    name: "Capão Bonito",
    value: 1
  }, {
    name: "Ponta Grossa",
    value: 1
  }, {
    name: "Juazeiro do Norte",
    value: 1
  }, {
    name: "Silvânia",
    value: 1
  }, {
    name: "Aruanã",
    value: 1
  }, {
    name: "Bela Vista de Goiás",
    value: 1
  }, {
    name: "Mineiros",
    value: 1
  }, {
    name: "Alfenas",
    value: 1
  }, {
    name: "Brasília",
    value: 1
  }, {
    name: "Canarana",
    value: 1
  }, {
    name: "Rio Maria",
    value: 1
  }, {
    name: "Alto Araguaia",
    value: 1
  }, {
    name: "Piracanjuba",
    value: 1
  }, {
    name: "Jarinu",
    value: 1
  }];

  // Dados de conhecimento/uso dos serviços da Safras & Cifras
  // Dados de conhecimento dos serviços S&C (67 respostas)
  const safrasServicesData: ChartData[] = [{
    name: "Sim, já sou cliente",
    value: 35,
    percentage: 52.24
  }, {
    name: "Já conheço, mas ainda não utilizo",
    value: 15,
    percentage: 22.39
  }, {
    name: "Já ouvi falar, mas não conheço bem",
    value: 15,
    percentage: 22.39
  }, {
    name: "Ainda não conheço",
    value: 2,
    percentage: 2.99
  }];

  // Dados de distribuição por faixa etária (atualizado)
  const ageRangeData: ChartData[] = [{
    name: "31 a 40 anos",
    value: 20,
    percentage: 29.85
  }, {
    name: "41 a 50 anos",
    value: 17,
    percentage: 25.37
  }, {
    name: "51 a 60 anos",
    value: 15,
    percentage: 22.39
  }, {
    name: "21 a 30 anos",
    value: 11,
    percentage: 16.42
  }, {
    name: "Mais de 60 anos",
    value: 3,
    percentage: 4.48
  }, {
    name: "Menos de 20 anos",
    value: 1,
    percentage: 1.49
  }];

  // Dados de experiência no agro (atualizado)
  const experienceData: ChartData[] = [{
    name: "Mais de 10 anos",
    value: 32,
    percentage: 47.76
  }, {
    name: "2 a 5 anos",
    value: 14,
    percentage: 20.90
  }, {
    name: "Menos de 2 anos",
    value: 11,
    percentage: 16.42
  }, {
    name: "6 a 10 anos",
    value: 10,
    percentage: 14.93
  }];

  // Dados de nível de gestão (atualizado)
  const managementLevelData: ChartData[] = [{
    name: "Intermediária",
    value: 34,
    percentage: 50.75
  }, {
    name: "Iniciante",
    value: 20,
    percentage: 29.85
  }, {
    name: "Avançada",
    value: 13,
    percentage: 19.40
  }];

  // Dados de profissão / papel principal (atualizado - categorias macro)
  const professionData: ChartData[] = [{
    name: "Sucessoras Familiares",
    value: 28,
    percentage: 41.79
  }, {
    name: "Gestoras / Setor Administrativo",
    value: 17,
    percentage: 25.37
  }, {
    name: "Produtoras Rurais",
    value: 14,
    percentage: 19.40
  }, {
    name: "Profissionais Especialistas (Adv/Vet/Agr)",
    value: 8,
    percentage: 11.94
  }];

  // Dados de principais atividades (atualizado - contagem de 63 respostas)
  const activitiesData: ChartData[] = [{
    name: "Soja",
    value: 58,
    percentage: 92.1
  }, {
    name: "Milho",
    value: 56,
    percentage: 88.9
  }, {
    name: "Pecuária",
    value: 23,
    percentage: 36.5
  }, {
    name: "Trigo",
    value: 9,
    percentage: 14.3
  }, {
    name: "Algodão",
    value: 7,
    percentage: 11.1
  }, {
    name: "Cana-de-Açúcar",
    value: 4,
    percentage: 6.3
  }, {
    name: "Feijão",
    value: 4,
    percentage: 6.3
  }, {
    name: "Hortifrúti",
    value: 3,
    percentage: 4.8
  }, {
    name: "Café",
    value: 2,
    percentage: 3.2
  }];

  // Dados de objetivo principal (atualizado)
  const objectivesData: ChartData[] = [{
    name: "Aprimorar a Gestão de Pessoas e Equipes",
    value: 47,
    percentage: 70.15
  }, {
    name: "Desenvolver Liderança e Autoconhecimento",
    value: 47,
    percentage: 70.15
  }, {
    name: "Organizar e Estruturar a Gestão da Propriedade/Empresa",
    value: 47,
    percentage: 70.15
  }, {
    name: "Ganhar Segurança na Tomada de Decisão",
    value: 38,
    percentage: 56.72
  }, {
    name: "Aprimorar a Comunicação e o Relacionamento Familiar",
    value: 34,
    percentage: 50.75
  }, {
    name: "Networking e Novas Conexões com Outras Mulheres do Agro",
    value: 34,
    percentage: 50.75
  }, {
    name: "Gestão Econômica e Financeira",
    value: 19,
    percentage: 28.36
  }];

  // Dados de tema de maior interesse (atualizado)
  const interestsData: ChartData[] = [{
    name: "Gestão Econômica e Financeira",
    value: 46,
    percentage: 68.66
  }, {
    name: "Planejamento Estratégico no Agro",
    value: 44,
    percentage: 65.67
  }, {
    name: "Gestão da Família e do Negócio",
    value: 40,
    percentage: 59.70
  }, {
    name: "Gestão Estratégica de Pessoas",
    value: 38,
    percentage: 56.72
  }, {
    name: "Gestão: Agro 4.0",
    value: 33,
    percentage: 49.25
  }];

  // Dados de nível de envolvimento na tomada de decisão (63 respostas)
  const decisionInvolvementData: ChartData[] = [{
    name: "Moderado",
    value: 22,
    percentage: 32.84
  }, {
    name: "Alto",
    value: 20,
    percentage: 29.85
  }, {
    name: "Baixo",
    value: 18,
    percentage: 26.87
  }, {
    name: "Total",
    value: 7,
    percentage: 10.45
  }];

  // Dados de grau de organização da gestão (escala 1-5, 67 respostas)
  const managementOrganizationData: DimensionRating = {
    dimension: "Grau de Organização da Gestão",
    average: 3.28,
    distribution: [
      { rating: 1, count: 2, percentage: 2.99 },
      { rating: 2, count: 10, percentage: 14.93 },
      { rating: 3, count: 28, percentage: 41.79 },
      { rating: 4, count: 22, percentage: 32.84 },
      { rating: 5, count: 5, percentage: 7.46 }
    ]
  };

  // Dados de participantes para Temas Sugeridos (atualizado em 21/01/2026)
  const participantsData: ParticipantData[] = [
    {
      id: 1,
      name: "Adaiane Bordin",
      state: "MS",
      isClient: "Sim",
      challenges: "Gestão de estratégica, planejamento tributário e gestão de pessoas",
      expectations: "Espero ampliar minha visao estrategica no agro, fortalecer minhas habilidades de lideranca e criar conexoes que impulsionem meu papel como gestora e protagonista do setor",
      additionalTopics: ""
    },
    {
      id: 2,
      name: "Alessandra Folador",
      state: "PR",
      isClient: "Sim",
      challenges: "Pessoal qualificado, comunicação entre alguns setores, treinamento de lideranças",
      expectations: "Espero ampliar minha visao estrategica no agro, fortalecer minhas habilidades de lideranca e criar conexoes que impulsionem meu papel como gestora e protagonista do setor",
      additionalTopics: ""
    },
    {
      id: 3,
      name: "Alice Chernicharo Souza Lima",
      state: "MG",
      isClient: "Sim",
      challenges: "Comunicado, delegar funções",
      expectations: "Será ideal para o meu crescimento",
      additionalTopics: "Gestão de pessoas, tomada de decisão, comunicação. Política interna!"
    },
    {
      id: 4,
      name: "Ana Cristina Tombini de Moraes",
      state: "MS",
      isClient: "Não",
      challenges: "Pessoas qualificadas, conhecimento e disciplina",
      expectations: "Desenvolver habilidades que não são usadas atualmente na minha gestão. Descobrir e fazer Network pra ter as conexões certas para aprender com quem já é sucesso ou está nesse rumo",
      additionalTopics: "Estratégias para aumentar a produtividade de pessoas com metas e premiação algo assim"
    },
    {
      id: 5,
      name: "Ângela Aguiar de Carvalho",
      state: "GO",
      isClient: "Não",
      challenges: "Fazer a fazenda se tornar rentável",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 6,
      name: "Angela van Lieshout",
      state: "GO",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: "Reforma tributária"
    },
    {
      id: 7,
      name: "Annielly de Carvalho Almeida Klaesener",
      state: "GO",
      isClient: "Não",
      challenges: "Controle de custos e rentabilidade. Gestão de pessoas e mão de obras qualificadas. Adaptação a tecnologias.",
      expectations: "Espero adquirir conhecimentos práticos e estratégicos para gerir o agronegócio de forma eficiente.",
      additionalTopics: "Inclusão da IA na Gestão."
    },
    {
      id: 8,
      name: "Bruna Queiróz",
      state: "GO",
      isClient: "Não",
      challenges: "Planejamento",
      expectations: "Experiência",
      additionalTopics: ""
    },
    {
      id: 9,
      name: "Carla Elisa Fontana Bueno de Paula",
      state: "MT",
      isClient: "Sim",
      challenges: "Gestão de pessoas",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 10,
      name: "Cristina dos Santos",
      state: "SP",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 11,
      name: "Daisy Karla De Marco",
      state: "GO",
      isClient: "Sim",
      challenges: "Separar a Pessoa Física da Jurídica na empresa familiar - aplicar as regras de governança com os acionistas",
      expectations: "Maior repertório para contribuir com o planejamento da longevidade no negócio familiar",
      additionalTopics: "Inovação no Agro - como diversificar e investir no horizonte 3"
    },
    {
      id: 12,
      name: "Daniela Périco",
      state: "MS",
      isClient: "Sim",
      challenges: "Encontrar mão de obra qualificada, tomar decisões mais assertivas e garantir um planejamento e organização integrados entre todos os setores são hoje os meus maiores desafios na gestão",
      expectations: "Adquirir conhecimento e trocar experiências com outras mulheres, trazendo novas perspectivas para aplicarmos no desenvolvimento e aprimoramento da nossa empresa",
      additionalTopics: "Gostaria que fosse abordado como melhorar a assertividade das decisões, conectando os dados financeiros, o planejamento e a gestão de pessoas, talvez incluir uma discussão sobre como alinhar família e empresa dentro da gestão, para evitar conflitos e facilitar decisões"
    },
    {
      id: 13,
      name: "Danielle Lamberte Kataki",
      state: "SP",
      isClient: "Não",
      challenges: "Gerir com mais profissionalismo. Adequar o grupo familiar a ferramentas administrativas mais modernas.",
      expectations: "Network e conhecimento a respeito do tema.",
      additionalTopics: "Sucessão familiar"
    },
    {
      id: 14,
      name: "Djenane Comparin",
      state: "MT",
      isClient: "Não",
      challenges: "Pessoas, respeito e domínio",
      expectations: "Aperfeiçoamento e aprendizagem",
      additionalTopics: "Técnicas para lidar com pessoas"
    },
    {
      id: 15,
      name: "Edina",
      state: "MS",
      isClient: "Não",
      challenges: "Tomada de decisão e financeiro",
      expectations: "",
      additionalTopics: "Novas tecnologias e IA"
    },
    {
      id: 16,
      name: "Edina Ferreira Bueno",
      state: "MS",
      isClient: "Sim",
      challenges: "",
      expectations: "Expectativa em sair mais experiente",
      additionalTopics: "Planejamento estratégico de retiradas análises segurança"
    },
    {
      id: 17,
      name: "Edina Pinto",
      state: "MT",
      isClient: "Não",
      challenges: "Comunicação familiar, gestão financeira e tomada de decisões",
      expectations: "Novos horizontes",
      additionalTopics: "Comunicação familiar na gestão"
    },
    {
      id: 18,
      name: "Elenir Raiter",
      state: "MS",
      isClient: "Não",
      challenges: "Funcionários",
      expectations: "Algo que eu possa inovar na minha empresa",
      additionalTopics: "Tudo é bem vindo"
    },
    {
      id: 19,
      name: "Eliane Cristina Krug Loeff",
      state: "MS",
      isClient: "Sim",
      challenges: "",
      expectations: "Aprendizado",
      additionalTopics: ""
    },
    {
      id: 20,
      name: "Elisa Bueno",
      state: "GO",
      isClient: "Sim",
      challenges: "Cumprimento de processos estabelecidos entre todos os envolvidos e também os papéis que cada um desenvolve dentro da empresa familiar; Entender e fundamentar os princípios de gestão para aplicabilidade na nossa rotina da fazenda, com funcionários e demais envolvidos; Melhorar a gestão e os resultados partindo de uma sucessão saudável e bem fundamentada, mantendo os princípios e o convívio no negócio familiar, melhorar negociação e números para compras mais assertivas.",
      expectations: "",
      additionalTopics: "Como melhorar a dinâmica de análise de custos e formar senso crítico para melhorar os resultados"
    },
    {
      id: 21,
      name: "Fabiana Mitsuko Aoyagui Viomar",
      state: "PR",
      isClient: "Sim",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 22,
      name: "Graziela",
      state: "MS",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 23,
      name: "Helenna Borges de Sousa Prudente",
      state: "GO",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 24,
      name: "Isabela Boenig Salles",
      state: "PR",
      isClient: "Não",
      challenges: "Planejamento e comercialização",
      expectations: "Espero muito conhecimento e experiências de outras mulheres",
      additionalTopics: "Reforma tributária"
    },
    {
      id: 25,
      name: "Janaina Flor de Leles",
      state: "MG",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 26,
      name: "Janaina Moreira Ferreira Guilherme",
      state: "MS",
      isClient: "Sim",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 27,
      name: "Jessika Losi",
      state: "PR",
      isClient: "Sim",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 28,
      name: "Julia Massi Sério",
      state: "SP",
      isClient: "Não",
      challenges: "Pessoas",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 29,
      name: "Julia Queiroz Piva",
      state: "PR",
      isClient: "Sim",
      challenges: "Ter confiança para exercer meu papel como sócia, aprender a me impor. Tenho pouco conhecimento sobre o agro em si, então gostaria de mudar isso.",
      expectations: "",
      additionalTopics: "Comunicação e networking."
    },
    {
      id: 30,
      name: "Juliana Comparin",
      state: "MT",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 31,
      name: "Juliana Harumi Nishi",
      state: "SP",
      isClient: "Sim",
      challenges: "Visualizar e traçar planos estratégicos e assertivos sobre a continuidade familiar; gestão de pessoas; desafios relacionados a legislação/política brasileira",
      expectations: "Estratégias direcionadas, concretas e aprendizados aprofundados sobre os assuntos. Onde devemos focar mais a nossa atenção, mesmo que ainda considerando a visão holística da empresa",
      additionalTopics: "Estratégias, planos personalizados para a longevidade da família e negócio. Mesmo que cada empresa familiar tenha desafios diferentes, espero sair com ideias promissoras para o futuro da empresa em que faço parte hoje."
    },
    {
      id: 32,
      name: "Juliana Hecke Tramontin",
      state: "SC",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: "Sucessão familiar; gestão em PF ou PJ; modelos de controle financeiro (sistemas, planilhas, aplicativos); exigências burocráticas para gestão do negócio no Brasil"
    },
    {
      id: 33,
      name: "Karine Bilibio Cesca Pimenta",
      state: "PR",
      isClient: "Sim",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 34,
      name: "Kasue Bilibio Cesca",
      state: "PR",
      isClient: "Sim",
      challenges: "Comunicação, controladoria e organização",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 35,
      name: "Lara Barili Bürgel",
      state: "MS",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 36,
      name: "Lara Lattarini Lozano",
      state: "SP",
      isClient: "Sim",
      challenges: "Falta de organização das funções, separação em ramos, clareza de dados",
      expectations: "",
      additionalTopics: "Investimentos em mercado financeiro do agro"
    },
    {
      id: 37,
      name: "Lillian Monique P Silva",
      state: "MG",
      isClient: "Não",
      challenges: "Mão de obra",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 38,
      name: "Lívia Cibele de Freitas Castro Loeff",
      state: "MS",
      isClient: "Sim",
      challenges: "Gestão de pessoas, Governança Familiar e Mercado financeiro",
      expectations: "Busca através do conhecimento pra desenvolver minhas habilidades e competências relacionadas ao trato com o ser humano",
      additionalTopics: "Sucessão Familiar"
    },
    {
      id: 39,
      name: "Marceli Vesz Gaiatto",
      state: "GO",
      isClient: "Sim",
      challenges: "Tecnologia para gestão por isso estou desenvolvendo um projeto inovador",
      expectations: "Conexão e experiência",
      additionalTopics: ""
    },
    {
      id: 40,
      name: "Maria Eduarda Görgen",
      state: "RS",
      isClient: "Sim",
      challenges: "Relacionamento familiar, enfrentamento na tomada de decisões",
      expectations: "Aprendizado, saber como me impor na gestão do Agronegócio",
      additionalTopics: ""
    },
    {
      id: 41,
      name: "Marina Weyand Marcolini Carvalho",
      state: "GO",
      isClient: "Sim",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 42,
      name: "Mariza Krug",
      state: "MS",
      isClient: "Sim",
      challenges: "Lidar com pessoas, 'achar gente comprometida', mão de obra especializada",
      expectations: "Conhecimento com foco voltado a prática e implementação do mesmo!",
      additionalTopics: "Gestão trabalhista no segmento agropecuário"
    },
    {
      id: 43,
      name: "Marli Teresa Munarini",
      state: "SC",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 44,
      name: "Monata Caroline Gorgen Barros",
      state: "RS",
      isClient: "Sim",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 45,
      name: "Monyque Isabella Costa",
      state: "PR",
      isClient: "Sim",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 46,
      name: "Natalia Yumi Nishi",
      state: "SP",
      isClient: "Sim",
      challenges: "Mudanças constantes em legislações. Dificuldade dos patriarcas em entenderem as mudanças gerando impacto na velocidade da tomada de decisão. Necessidade de elevar o nível de conhecimento teórico da equipe de gestão/sucessão.",
      expectations: "Experiências reais, dores e alegrias do negócio familiar. Agregar mais conhecimento na área",
      additionalTopics: ""
    },
    {
      id: 47,
      name: "Pâmela Cristina Rohr",
      state: "SC",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 48,
      name: "Priscila Tombini",
      state: "MS",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 49,
      name: "Priscilla Napoli",
      state: "SP",
      isClient: "Sim",
      challenges: "Família, financeiro e gestão de pessoas",
      expectations: "Os fins justificam os meios 😉",
      additionalTopics: "Como enfrentar os desafios de gerir uma empresa familiar, tendo muitos conflitos com o atual gestor."
    },
    {
      id: 50,
      name: "Reane Migliavacca",
      state: "RS",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 51,
      name: "Regiana de Souza Rezende",
      state: "GO",
      isClient: "Não",
      challenges: "Financeiro, liderança e organização",
      expectations: "Muito Aprendizado e conhecimento",
      additionalTopics: "Financeiro sugestão de planilha"
    },
    {
      id: 52,
      name: "Rejane Paula Pezzini",
      state: "MS",
      isClient: "Sim",
      challenges: "Não temos um sistema prático e eficiente para atender as demandas do produtor",
      expectations: "Curso dinâmico e cheio de conhecimento que agrega para nós como sucessores e gestores do agro",
      additionalTopics: "Sobre formação de preço, bolsa de valores, tentar entender mais sobre os temas para acertar na tomada de decisão sobre a melhor hora para venda dos grãos"
    },
    {
      id: 53,
      name: "Rosanna Mosena",
      state: "RS",
      isClient: "Não",
      challenges: "Organizar de forma adequada a gestão financeira",
      expectations: "Que traga sugestões concretas e acessíveis de aplicação",
      additionalTopics: ""
    },
    {
      id: 54,
      name: "Rubia M Lira Mocheuti",
      state: "MS",
      isClient: "Não",
      challenges: "Organização, gestão",
      expectations: "Obter mais conhecimento para ter mais segurança nas tomadas de decisões.",
      additionalTopics: "Gestão econômica e organização e planejamento"
    },
    {
      id: 55,
      name: "Salete Gonçalves da Silva",
      state: "GO",
      isClient: "Sim",
      challenges: "Pessoas",
      expectations: "Aprendizado",
      additionalTopics: "Não"
    },
    {
      id: 56,
      name: "Simone Cristina Dameto",
      state: "MT",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 57,
      name: "Thaynara Cardoso Donegá",
      state: "SP",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 58,
      name: "Vania Ferreira da Silva Rocha",
      state: "GO",
      isClient: "Não",
      challenges: "Pessoas, Processos, Gestão Estratégica e Sucessão Familiar",
      expectations: "O que for repassado no curso deve ser passível de aplicação na prática",
      additionalTopics: "Pessoas, Processos, Gestão Estratégica e Sucessão Familiar"
    },
    {
      id: 59,
      name: "Vitória",
      state: "MS",
      isClient: "Sim",
      challenges: "Creio que a falta de conhecimento e comunicação da terceira geração com a empresa, parece não ter 'espaço' para já engrossar dentro da empresa",
      expectations: "Quero que seja produtiva e que consiga implantar estratégias para abordarmos no nosso dia a dia",
      additionalTopics: ""
    },
    {
      id: 60,
      name: "Viviane Maria Favreto Tomm",
      state: "RS",
      isClient: "Sim",
      challenges: "",
      expectations: "Já sei que o tempo será pouco para tanto tema importante",
      additionalTopics: ""
    },
    {
      id: 61,
      name: "Yasmin de Arruda Loeff",
      state: "MS",
      isClient: "Sim",
      challenges: "Comunicação, tomada de decisões financeiras e gestão de pessoas",
      expectations: "",
      additionalTopics: "Reforma Tributária, seus impactos no agronegócio e o que poderemos fazer"
    },
    {
      id: 62,
      name: "Ana Cristina Pelarin",
      state: "SP",
      isClient: "Sim",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 63,
      name: "Ana Flávia de Carvalho",
      state: "GO",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 64,
      name: "Ana Cecilia Mota Fontana",
      state: "MT",
      isClient: "Sim",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 65,
      name: "Amanda Calegari",
      state: "PR",
      isClient: "Sim",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 66,
      name: "Claudia Suemi Aoyagui Caumo",
      state: "PR",
      isClient: "Sim",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    },
    {
      id: 67,
      name: "Estela Barili Burgel",
      state: "MS",
      isClient: "Não",
      challenges: "",
      expectations: "",
      additionalTopics: ""
    }
  ];
  return <div className="min-h-screen bg-background">
      {/* Premium Header */}
      <div className="bg-primary shadow-soft border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-primary/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              <Button variant="ghost" size="sm" onClick={() => navigate("/gestoras-do-agro")} className="text-white hover:bg-white/10 p-2 transition-colors flex-shrink-0" aria-label="Voltar">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="space-y-0.5 min-w-0">
                <h1 className="text-base sm:text-lg md:text-2xl font-bold leading-tight text-white truncate sm:whitespace-normal">
                  Mapeamento de Perfil - Gestoras do Agro 2025
                </h1>
                <p className="text-xs sm:text-sm text-white/80 mt-1 hidden sm:block">
                  Baseado nas respostas das participantes do formulário de pesquisa.
                </p>
                <a href="https://docs.google.com/spreadsheets/d/1AZF_pho-f-9KHrvLfpzlHCjgSJ69F_LMbPhmo9fwNZ0/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white/90 transition-colors mt-1.5 hidden sm:inline-flex">
                  <FileText className="h-3 w-3" />
                  Ver planilha de respostas
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        <div className="w-full space-y-6">
          {/* Overview Cards */}
          <section className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-6">Visão geral</h2>
            <GestorasOverviewCards stats={{
            totalParticipants: 80,
            totalResponses: 46,
            clientCount: 28,
            clientPercentage: 60.9,
            nonClientCount: 18,
            nonClientPercentage: 39.1
          }} />
          </section>

          {/* Brazil Map */}
          <section className="animate-fade-in" style={{
          animationDelay: '50ms'
        }}>
            <GestorasBrazilMap stateData={stateData} cityData={cityData} />
          </section>

          {/* Charts Grid */}
          <section className="animate-fade-in" style={{
          animationDelay: '100ms'
        }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DonutChart title="Você já conhece ou utiliza os serviços da Safras & Cifras?" data={safrasServicesData} colors={["hsl(var(--client-yes))", "hsl(var(--client-know))", "hsl(var(--client-heard))", "hsl(var(--client-no))"]} />
              <HorizontalBarChart title="Faixa Etária" data={ageRangeData} customOrder={["21 a 30 anos", "31 a 40 anos", "41 a 50 anos", "Menos de 20 anos", "51 a 60 anos", "Mais de 60 anos"]} useGreenGradient={true} />
              <HorizontalBarChart title="Experiência no Agro" data={experienceData} />
              <HorizontalBarChart title="Nível de Gestão" data={managementLevelData} />
            </div>

            {/* Rating Scale Card - Full Width */}
            <RatingScaleCard 
              data={managementOrganizationData} 
              title="Como você avalia o grau de organização da gestão na sua propriedade/empresa hoje?" 
              className="mt-6"
            />
          </section>

          {/* Análise Detalhada Section */}
          <section className="animate-fade-in" style={{
          animationDelay: '150ms'
        }}>
            <h2 className="text-2xl font-bold text-foreground mb-6">Análise detalhada</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HorizontalBarChart title="Profissão / Papel Principal" data={professionData} maxItems={10} />
              <HorizontalBarChart title="Nível de Envolvimento na Tomada de Decisão" data={decisionInvolvementData} />
              <HorizontalBarChart title="Objetivo principal" data={objectivesData} maxItems={10} />
              <HorizontalBarChart title="Tema de maior interesse" data={interestsData} maxItems={10} />
            </div>
          </section>

          {/* Temas Sugeridos Section */}
          <SuggestedTopicsCard participants={participantsData} />
        </div>
      </main>
    </div>;
};
export default GestorasAgroDashboard;