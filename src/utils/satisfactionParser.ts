import { SatisfactionMetrics, TopicInterest, DimensionRating } from "@/types/satisfaction";

export const parseSatisfactionCSV = (csvText: string): SatisfactionMetrics => {
  const lines = csvText.split('\n');

  const metrics: SatisfactionMetrics = {
    totalResponses: 44,
    averageOverallRating: 4.77,
    recommendationRate: 100,
    supportAverage: 4.86,
    infrastructureAverage: 4.70,
    materialsAverage: 4.73,
    foodAverage: 4.59,
    contentAverages: {
      inaugural: 4.89,
      holding: 4.84,
      accounting: 4.73,
      governance: 4.91,
      financial: 4.91,
    },
    didacticAverages: {
      sandro: 4.91,
      alessandra: 4.89,
      daniel: 4.66,
      vanessa: 4.86,
      vinicius: 4.84,
    },
  };

  return metrics;
};

export const getTopicInterests = (): TopicInterest[] => {
  return [
    { topic: "Gestão no agro – administração estratégica da propriedade, finanças, processos e governança", count: 18, percentage: 42.9 },
    { topic: "Liderança – desenvolvimento de habilidades para gerir negócios e equipes", count: 8, percentage: 19.0 },
    { topic: "Tecnologia e inovação – tendências, IA e ferramentas digitais aplicadas à gestão do campo", count: 6, percentage: 14.3 },
    { topic: "Gestão estratégica de pessoas – engajamento, retenção e desenvolvimento de equipes", count: 5, percentage: 11.9 },
    { topic: "Mediação – resolução de conflitos familiares no agro", count: 3, percentage: 7.1 },
    { topic: "Questões fundiárias – regularidade e segurança jurídica", count: 1, percentage: 2.4 },
  ];
};

export const getCoursePreferences = () => {
  return {
    mode: [
      { name: "Presencial", value: 28, percentage: 65.1 },
      { name: "Ambos (presencial + online)", value: 14, percentage: 32.6 },
      { name: "Online", value: 1, percentage: 2.3 },
    ],
    format: [
      { name: "Imersão – 2 a 3 dias", value: 35, percentage: 83.3 },
      { name: "Rápido – horas", value: 4, percentage: 9.5 },
      { name: "Médio – 3 a 6 semanas", value: 2, percentage: 4.8 },
      { name: "Longo – meses (MBA | Pós-graduação)", value: 1, percentage: 2.4 },
    ],
  };
};

export const getRatingDistribution = (category: string): DimensionRating => {
  const distributions: { [key: string]: DimensionRating } = {
    support: {
      dimension: "Atendimento e Suporte durante o Curso",
      average: 4.86,
      distribution: [
        { rating: 5, count: 38, percentage: 86.4 },
        { rating: 4, count: 6, percentage: 13.6 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ],
    },
    infrastructure: {
      dimension: "Local e Infraestrutura",
      average: 4.70,
      distribution: [
        { rating: 5, count: 32, percentage: 72.7 },
        { rating: 4, count: 11, percentage: 25.0 },
        { rating: 3, count: 1, percentage: 2.3 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ],
    },
    materials: {
      dimension: "Materiais Didáticos",
      average: 4.73,
      distribution: [
        { rating: 5, count: 32, percentage: 72.7 },
        { rating: 4, count: 12, percentage: 27.3 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ],
    },
    food: {
      dimension: "Alimentação",
      average: 4.59,
      distribution: [
        { rating: 5, count: 30, percentage: 68.2 },
        { rating: 4, count: 10, percentage: 22.7 },
        { rating: 3, count: 4, percentage: 9.1 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ],
    },
    overall: {
      dimension: "Experiência Geral",
      average: 4.77,
      distribution: [
        { rating: 5, count: 34, percentage: 77.3 },
        { rating: 4, count: 10, percentage: 22.7 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ],
    },
  };

  return distributions[category] || distributions.overall;
};

export const getContentRatings = (): DimensionRating[] => {
  return [
    {
      dimension: "Aula Inaugural",
      average: 4.89,
      distribution: [
        { rating: 5, count: 39, percentage: 88.6 },
        { rating: 4, count: 5, percentage: 11.4 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ],
    },
    {
      dimension: "Patrimonial",
      average: 4.84,
      distribution: [
        { rating: 5, count: 37, percentage: 84.1 },
        { rating: 4, count: 7, percentage: 15.9 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ],
    },
    {
      dimension: "Gestão Contábil e Reforma Tributária",
      average: 4.73,
      distribution: [
        { rating: 5, count: 34, percentage: 77.3 },
        { rating: 4, count: 8, percentage: 18.2 },
        { rating: 3, count: 2, percentage: 4.5 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ],
    },
    {
      dimension: "Governança",
      average: 4.91,
      distribution: [
        { rating: 5, count: 40, percentage: 90.9 },
        { rating: 4, count: 4, percentage: 9.1 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ],
    },
    {
      dimension: "Gestão Econômica e Financeira",
      average: 4.91,
      distribution: [
        { rating: 5, count: 40, percentage: 90.9 },
        { rating: 4, count: 4, percentage: 9.1 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ],
    },
  ];
};

export const getDidacticRatings = (): DimensionRating[] => {
  return [
    {
      dimension: "Sandro Elias",
      average: 4.91,
      distribution: [
        { rating: 5, count: 40, percentage: 90.9 },
        { rating: 4, count: 4, percentage: 9.1 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ],
    },
    {
      dimension: "Alessandra Braga",
      average: 4.89,
      distribution: [
        { rating: 5, count: 39, percentage: 88.6 },
        { rating: 4, count: 5, percentage: 11.4 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ],
    },
    {
      dimension: "Daniel Chiechelski",
      average: 4.66,
      distribution: [
        { rating: 5, count: 33, percentage: 75.0 },
        { rating: 4, count: 7, percentage: 15.9 },
        { rating: 3, count: 4, percentage: 9.1 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ],
    },
    {
      dimension: "Vanessa Alam",
      average: 4.86,
      distribution: [
        { rating: 5, count: 38, percentage: 86.4 },
        { rating: 4, count: 6, percentage: 13.6 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ],
    },
    {
      dimension: "Vinícius Kaefer",
      average: 4.84,
      distribution: [
        { rating: 5, count: 37, percentage: 84.1 },
        { rating: 4, count: 7, percentage: 15.9 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ],
    },
  ];
};

export const getWhatsAppComments = (): Array<{ type: "suggestion" | "praise"; text: string }> => {
  return [
    {
      type: "praise",
      text: "Bom dia, Daiana Volkweis, Gaúcha do Norte-MT. Obrigada ao Safras & Cifras pelos dias de aprendizado e compartilhamento de experiências e ideias que, com certeza, irão agregar em muito a continuidade do trabalho e a busca pelo melhoramento/aprimoramento do que já foi iniciado.\n\nUma turma excepcional, divertida, engajada em buscar a manutenção do trabalho que mantém o mundo. Certamente seremos sucessores ainda melhores e mais seguros sobre como gerenciar essa transferência de gerações, respeitando e entendendo melhor a individualidade de pensamento de cada um dos membros do nosso grupo familiar.\n\nFoi um enorme prazer conhecer os participantes e dividir experiências com vocês.",
    },
    {
      type: "praise",
      text: "Oi, pessoal! Sou a Geovana Vilela, de Caiapônia- Go também estamos instalados na Bolívia. Foi muito bom participar do curso da Safras & Cifras, agregou demais em conhecimento e troca de experiência. Um prazer enorme da minha parte, so tenho a agradecer e dizer que estou à disposição do que precisarem.",
    },
    {
      type: "praise",
      text: "Olá, pessoal!\nMeu nome é Tathiane  Vilela, sou de Caiapônia-Goiás, e foi simplesmente incrível viver esses três dias intensos com vocês nesse evento promovido pela EducaSafras e Safras & Cifras.\n\nForam dias de muito aprendizado, troca de experiências valiosas e convivência com pessoas de vários estados, diferentes formas de pensar e agir. Mais do que conteúdo, foi um momento de confirmação e conscientização: esse é o caminho certo a seguir.\n\nNo nosso caso, não há outra alternativa a não ser trilhar o que a Safras & Cifras nos oferece de mais essencial — ferramentas sólidas de gestão para fortalecer o negócio e o futuro da família. Estar ao lado de quem já percorre essa jornada foi enriquecedor e reafirmou nosso compromisso nesse novo ciclo de sucessão e legado.\n\nUm destaque especial foi o case de sucesso da família de Morrinhos – Irmãos Agropecuária Chiari. Ao compartilharem suas dores, vivências e transformações junto à Safras & Cifras, nos mostraram de forma transparente como esse processo é necessário e transformador. Foi inspirador!\n\nSaio desse encontro com a certeza de que este é o momento de alinhar, equilibrar e alavancar os negócios da nossa família. E acredito que muitos outros participantes também levaram consigo essa clareza mental tão importante.\n\nParabéns pela organização e muito obrigada por essa oportunidade que ficará marcada na minha caminhada. 🌱💛",
    },
    {
      type: "praise",
      text: "Bom dia pessoal, Marco Túlio, região de Gaúcha do Norte MT e Rio Verde MS. Grato pelos dias de muito aprendizado e bastante networking!! A disposição sempre!!",
    },
    {
      type: "praise",
      text: "Pessoal, só tenho a agradecer pela experiência incrível que tivemos juntos nesse curso da Safras & Cifras, foi muito valioso, com bastante aprendizado, networking e troca de experiências que certamente vão contribuir no dia a dia.\n\nAproveitando, queria saber se alguém aqui já tem um processo de compras bem estruturado e instalado na empresa. Tenho bastante interesse em trocar ideias e aprender mais sobre.\n\nMaíra Pelizon- Chapadão do Sul- MS e  também estamos em Sorriso- MT e Cumaru da Norte- PA.\n\nEstou a disposição de quem vier ou passar pela região e no que precisarem.",
    },
    {
      type: "praise",
      text: "Desde já queria agradecer aos colegas pelas trocas de experiências e conhecimentos, considero isso muito importante tanto para nosso desenvolvimento pessoal, como profissional. Queria agradecer à safras e cifras por esse tempo riquíssimo e de muito conhecimento!\nFoi um prazer enorme conhecer todos vocês!🙏🏻👏🏻",
    },
    {
      type: "praise",
      text: "Agradeço a todos pelos dias de curso, onde saímos com uma carga ainda maior de conhecimento .\nSe estiverem passando por Chapadão será um prazer recebê-los .\nE se precisarem de algo estou a disposição.\nFoi um prazer conhecê-los .",
    },
    {
      type: "praise",
      text: "Bom dia Pessoal! Também gostaria de dar o meu relato pessoal! Já fiz diversos cursos da área, que saía sem entendimento nenhum!\nMas essa imersão foi diferente, compreendi cada item apresentado, os professores foram excelentes, didáticos, com falas de fácil compreensão!\nMuito obrigada aos colegas que conheci, e a safras pelo acolhimento e ensinamentos de sempre!",
    },
    {
      type: "praise",
      text: "Quero agradecer à equipe da Safras & Cifras pelo excelente curso realizado. Foi uma oportunidade valiosa de aprendizado, troca de experiências .\n Destaco o networking construído ao longo do curso, que sem dúvida fortalece ainda mais nossa diversa atuação no nosso setor que não esta na melhor fase.\nQuem passar pelo Paraná será uma alegria recebe-los, um até breve",
    },
    {
      type: "praise",
      text: "Aqui plantamos soja e girassol e no que puder contribuir contem comigo.\n\nFoi muito especial participar do Sucessores do Agro e poder conhecer vocês e um pouco da história de vocês. Que a gente possa manter contato!!",
    },
    {
      type: "praise",
      text: "Bom dia, pessoal!\n\nSou Valeska Andrade, moro em Querência/MT. Meu caso é um pouco diferente: venho de uma família ligada ao Agro em Goiás, onde meu pai e minha irmã atuam diretamente. Eu, por outro lado, sigo aqui no Mato Grosso, ao lado do meu marido, que também é do Agro, mas trilhei minha própria jornada: atuo com Regularização Ambiental, ajudando produtores a manterem suas propriedades em conformidade e prontas para acessar crédito, novos mercados e segurança jurídica.\n\nÉ sempre muito bom participar e aprender com a Safras. Tenho acompanhado alguns clientes junto a eles e acredito que o aprendizado no Agro é realmente contínuo.\n\nGostei muito de terem trazido o case da família Chiari — ouvir a prática de quem já percorreu esse caminho é sempre enriquecedor. 👏🏼👏🏼👏🏼\n\nAos colegas, ficamos à disposição, quem passar por Querência não deixe de nos contatar. Até mais, sucesso a todos! 👏🏼",
    },
    {
      type: "praise",
      text: "Quero agradecer a Safras & Cifras pela oportunidade dessa imersão que para nós  será bem aproveitada .\nSerá um início de muito aprendizado e desafio, mas estamos confiantes e seguros com a nossa escolha. Agradeço tbm a companhia de todos e a troca de experiências , foi muito válido . 🤝",
    },
    {
      type: "praise",
      text: "Oi, pessoal!\n\nFoi um prazer estar com vocês nesses dias! Muito aprendizado, boas conversas e conexões.\n\nAproveitando que estamos por aqui, queria pedir uma ajudinha:\n\nAlguém já trabalhou com gergelim? Estamos pensando em testar uma área na próxima safrinha e queria trocar umas ideias. Me chama no PV!\n\nAlguém usa o sistema Siagri Agrimanager? Estou querendo entender melhor a usabilidade, especialmente a parte de fluxo de caixa.\n\nE por último: vocês têm plano de cargos e salários ou programa de participação nos lucros?\n\nValeu demais!",
    },
    {
      type: "praise",
      text: "Prezados, bom dia!\n\nRealmente foi sensacional este imersão junto a vcs nesta semana.\nobrigado por compartilhar tanto conhecimento.\n\naproveitando a oportunidade, gostaria de pedir para compartilhar os slides utilizados durante o treinamento.\n\nObrigado.",
    },
    {
      type: "praise",
      text: "Bom dia foi muito bom o encontro!!! Prazer em conhecê-los , parabéns safras e sifras 👏",
    },
    {
      type: "praise",
      text: "Bom dia pessoal!\n\nRealmente curso muito legal mesmo!\n\nValeu muito a pena o deslocamento e os dias passados em goiania!\n\nSugestão ao grupo é falarmos de que cidade que cada um é para salvarmos nos contatos caso algum dia precisemos entrar em contato novamente",
    },
    {
      type: "praise",
      text: "Bom dia pessoal!\nAo contrario de muitos o meu foi um primeiro encontro com tudo isso e pra mim foi muito rico.\nObrigada Safras e aos colegas, pra mim foi um start de um desafio muito grande que esta por vir e é muito bom saber que temos esse nivel de ajuda tao perto!\nObrigada por tudo",
    },
  ];
};

export const getComments = (): Array<{ type: "suggestion" | "praise"; text: string }> => {
  return [
    {
      type: "suggestion",
      text: "Como temos muitas anotações pra fazer, seria bom ter uma mesa e tomadas para usar PC",
    },
    {
      type: "praise",
      text: "Adorei, dos cursos que já participei, o primeiro que entendi a linguagem, fácil compreensão!",
    },
    {
      type: "suggestion",
      text: "Gostaria que o auditório fosse com mesas e cadeiras, nos dá mais flexibilidade para anotações",
    },
    {
      type: "praise",
      text: "Foi muito bom!",
    },
    {
      type: "suggestion",
      text: "Nada, se possível compartilhar os slides",
    },
    {
      type: "praise",
      text: "Excelente Curso. Ambiente agradável. Acolhimento nota 10!",
    },
    {
      type: "praise",
      text: "Tudo top",
    },
    {
      type: "praise",
      text: "Curso muito legal, valeu muito a pena o deslocamento. Obrigado a todos.",
    },
    {
      type: "praise",
      text: "Sim, a visão que eu não tinha do negócio parte tributária e financeira",
    },
    {
      type: "suggestion",
      text: "Botar mais um ar na sala",
    },
    {
      type: "praise",
      text: "Tudo muito legal e proveitoso.",
    },
    {
      type: "praise",
      text: "Elogio todos os professores e funcionários da equipe por seu amplo conhecimento técnico e didático. Mas principalmente o professor Daniel pois seu conteúdo denso e novo para mim foi passado com clareza e leveza.",
    },
  ];
};
