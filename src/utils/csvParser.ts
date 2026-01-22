import { ParticipantData } from "@/types/dashboard";

export const parseCSVData = (csvText: string): ParticipantData[] => {
  const lines = csvText.split('\n');
  const participants: ParticipantData[] = [];
  
  // Skip header and empty lines
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.split(',').every(cell => !cell.trim())) continue;

    const columns = parseCSVLine(line);
    if (columns.length >= 13) {
      const hasTimestamp = columns[1] && columns[1].trim() !== '';
      participants.push({
        id: parseInt(columns[0]) || i - 1,
        name: columns[2] || '',
        age: columns[3] || '',
        gender: columns[4] || '',
        city: columns[5] || '',
        state: columns[6] || '',
        region: columns[7] || '',
        profession: columns[8] || '',
        experience: columns[9] || '',
        activities: columns[10] || '',
        objectives: columns[11] || '',
        successionLevel: columns[12] || '',
        interests: columns[13] || '',
        isClient: columns[14] || '',
        additionalTopics: columns[15] || '',
        expectations: columns[16] || '',
        hasResponded: hasTimestamp
      });
    }
  }
  
  return participants;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

// Normalize text by removing accents, fixing common typos, and standardizing format
export const normalizeText = (text: string): string => {
  if (!text) return '';
  
  return text
    // Remove leading/trailing spaces and normalize internal spaces
    .trim()
    .replace(/\s+/g, ' ')
    // Add proper accents to common Brazilian Portuguese words
    .replace(/\bcafe\b/gi, 'Café')
    .replace(/\bfeijao\b/gi, 'Feijão')
    .replace(/\bmilho\b/gi, 'Milho')
    .replace(/\balgodao\b/gi, 'Algodão')
    .replace(/\bsoja\b/gi, 'Soja')
    .replace(/\bcana\b/gi, 'Cana')
    .replace(/\bpecuaria\b/gi, 'Pecuária')
    .replace(/\bbovinos\b/gi, 'Bovinos')
    .replace(/\bsuinos\b/gi, 'Suínos')
    .replace(/\baves\b/gi, 'Aves')
    .replace(/\bfrangos\b/gi, 'Frangos')
    .replace(/\bhortalicas\b/gi, 'Hortaliças')
    .replace(/\bfrutas\b/gi, 'Frutas')
    .replace(/\bcitricultura\b/gi, 'Citricultura')
    .replace(/\bviticultura\b/gi, 'Viticultura')
    .replace(/\bolericultura\b/gi, 'Olericultura')
    .replace(/\bfloricultura\b/gi, 'Floricultura')
    .replace(/\bapicultura\b/gi, 'Apicultura')
    .replace(/\bpiscicultura\b/gi, 'Piscicultura')
    .replace(/\bavicultura\b/gi, 'Avicultura')
    .replace(/\bsuinocultura\b/gi, 'Suinocultura')
    .replace(/\bbovinocultura\b/gi, 'Bovinocultura')
    .replace(/\bequinocultura\b/gi, 'Equinocultura')
    .replace(/\bcaprinos\b/gi, 'Caprinos')
    .replace(/\bovinos\b/gi, 'Ovinos')
    .replace(/\bbufalos\b/gi, 'Búfalos')
    .replace(/\bequinos\b/gi, 'Equinos')
    .replace(/\bmuares\b/gi, 'Muares')
    .replace(/\birrigacao\b/gi, 'Irrigação')
    .replace(/\bmaquinas\b/gi, 'Máquinas')
    .replace(/\bequipamentos\b/gi, 'Equipamentos')
    .replace(/\binsumos\b/gi, 'Insumos')
    .replace(/\bfertilizantes\b/gi, 'Fertilizantes')
    .replace(/\bdefensivos\b/gi, 'Defensivos')
    .replace(/\bsementes\b/gi, 'Sementes')
    .replace(/\bmudas\b/gi, 'Mudas')
    .replace(/\bracao\b/gi, 'Ração')
    .replace(/\bnutricao\b/gi, 'Nutrição')
    .replace(/\bsaude\b/gi, 'Saúde')
    .replace(/\bveterinaria\b/gi, 'Veterinária')
    .replace(/\bzootecnia\b/gi, 'Zootecnia')
    .replace(/\bagronomia\b/gi, 'Agronomia')
    .replace(/\bengenharia\b/gi, 'Engenharia')
    .replace(/\badministracao\b/gi, 'Administração')
    .replace(/\bcontabilidade\b/gi, 'Contabilidade')
    .replace(/\beconomia\b/gi, 'Economia')
    .replace(/\bmarketing\b/gi, 'Marketing')
    .replace(/\bvendas\b/gi, 'Vendas')
    .replace(/\bcompras\b/gi, 'Compras')
    .replace(/\blogistica\b/gi, 'Logística')
    .replace(/\btransporte\b/gi, 'Transporte')
    .replace(/\barmazenagem\b/gi, 'Armazenagem')
    .replace(/\bbeneficiamento\b/gi, 'Beneficiamento')
    .replace(/\bprocessamento\b/gi, 'Processamento')
    .replace(/\bindustrializacao\b/gi, 'Industrialização')
    .replace(/\bcomercializacao\b/gi, 'Comercialização')
    .replace(/\bexportacao\b/gi, 'Exportação')
    .replace(/\bimportacao\b/gi, 'Importação')
    .replace(/\bcertificacao\b/gi, 'Certificação')
    .replace(/\brastreabilidade\b/gi, 'Rastreabilidade')
    .replace(/\bqualidade\b/gi, 'Qualidade')
    .replace(/\bseguranca\b/gi, 'Segurança')
    .replace(/\bsustentabilidade\b/gi, 'Sustentabilidade')
    .replace(/\borganico\b/gi, 'Orgânico')
    .replace(/\bagroecologia\b/gi, 'Agroecologia')
    .replace(/\bpermacultura\b/gi, 'Permacultura')
    .replace(/\binovacao\b/gi, 'Inovação')
    .replace(/\btecnologia\b/gi, 'Tecnologia')
    .replace(/\bautomacao\b/gi, 'Automação')
    .replace(/\brobotica\b/gi, 'Robótica')
    .replace(/\bdrones\b/gi, 'Drones')
    .replace(/\bsatelites\b/gi, 'Satélites')
    .replace(/\bsensores\b/gi, 'Sensores')
    .replace(/\bmonitoramento\b/gi, 'Monitoramento')
    .replace(/\bprecisao\b/gi, 'Precisão')
    .replace(/\bdigital\b/gi, 'Digital')
    .replace(/\binteligencia\b/gi, 'Inteligência')
    .replace(/\bartificial\b/gi, 'Artificial')
    .replace(/\bmachine\b/gi, 'Machine')
    .replace(/\blearning\b/gi, 'Learning')
    .replace(/\bbig\b/gi, 'Big')
    .replace(/\bdata\b/gi, 'Data')
    .replace(/\banalytics\b/gi, 'Analytics')
    .replace(/\biot\b/gi, 'IoT')
    .replace(/\binternet\b/gi, 'Internet')
    .replace(/\bcoisas\b/gi, 'Coisas')
    .replace(/\bblockchain\b/gi, 'Blockchain')
    .replace(/\bcriptomoedas\b/gi, 'Criptomoedas')
    .replace(/\bfintech\b/gi, 'Fintech')
    .replace(/\bagtech\b/gi, 'AgTech')
    .replace(/\bfoodtech\b/gi, 'FoodTech')
    .replace(/\bstartup\b/gi, 'Startup')
    .replace(/\bstartups\b/gi, 'Startups')
    .replace(/\bempreendedorismo\b/gi, 'Empreendedorismo')
    .replace(/\bnegocios\b/gi, 'Negócios')
    .replace(/\bgestao\b/gi, 'Gestão')
    .replace(/\bplanejamento\b/gi, 'Planejamento')
    .replace(/\bestrategia\b/gi, 'Estratégia')
    .replace(/\bgovernanca\b/gi, 'Governança')
    .replace(/\bsucessao\b/gi, 'Sucessão')
    .replace(/\bfamilia\b/gi, 'Família')
    .replace(/\bfamiliar\b/gi, 'Familiar')
    .replace(/\bpatrimonio\b/gi, 'Patrimônio')
    .replace(/\bheranca\b/gi, 'Herança')
    .replace(/\btestamento\b/gi, 'Testamento')
    .replace(/\binventario\b/gi, 'Inventário')
    .replace(/\bpartilha\b/gi, 'Partilha')
    .replace(/\bdoacao\b/gi, 'Doação')
    .replace(/\busufructo\b/gi, 'Usufruto')
    .replace(/\bnua\b/gi, 'Nua')
    .replace(/\bpropriedade\b/gi, 'Propriedade')
    .replace(/\btitularidade\b/gi, 'Titularidade')
    .replace(/\bposse\b/gi, 'Posse')
    .replace(/\bdominio\b/gi, 'Domínio')
    .replace(/\bregistro\b/gi, 'Registro')
    .replace(/\bcartorio\b/gi, 'Cartório')
    .replace(/\bescriturapublica\b/gi, 'Escritura Pública')
    .replace(/\bprocuracao\b/gi, 'Procuração')
    .replace(/\bmandato\b/gi, 'Mandato')
    .replace(/\brepresentacao\b/gi, 'Representação')
    .replace(/\btutela\b/gi, 'Tutela')
    .replace(/\bcuratela\b/gi, 'Curatela')
    .replace(/\badocao\b/gi, 'Adoção')
    .replace(/\bfiliacao\b/gi, 'Filiação')
    .replace(/\bpaternidade\b/gi, 'Paternidade')
    .replace(/\bmaternidade\b/gi, 'Maternidade')
    .replace(/\bcasamento\b/gi, 'Casamento')
    .replace(/\buniao\b/gi, 'União')
    .replace(/\bestavel\b/gi, 'Estável')
    .replace(/\bregime\b/gi, 'Regime')
    .replace(/\bbens\b/gi, 'Bens')
    .replace(/\bcomunhao\b/gi, 'Comunhão')
    .replace(/\bmeacao\b/gi, 'Meação')
    .replace(/\blegitima\b/gi, 'Legítima')
    .replace(/\bherdeiro\b/gi, 'Herdeiro')
    .replace(/\bherdeiros\b/gi, 'Herdeiros')
    .replace(/\bsucessor\b/gi, 'Sucessor')
    .replace(/\bsucessores\b/gi, 'Sucessores')
    .replace(/\bdescendente\b/gi, 'Descendente')
    .replace(/\bdescendentes\b/gi, 'Descendentes')
    .replace(/\bascendente\b/gi, 'Ascendente')
    .replace(/\bascendentes\b/gi, 'Ascendentes')
    .replace(/\bcolateral\b/gi, 'Colateral')
    .replace(/\bcolaterais\b/gi, 'Colaterais')
    .replace(/\bfilho\b/gi, 'Filho')
    .replace(/\bfilhos\b/gi, 'Filhos')
    .replace(/\bfilha\b/gi, 'Filha')
    .replace(/\bfilhas\b/gi, 'Filhas')
    .replace(/\bpai\b/gi, 'Pai')
    .replace(/\bmae\b/gi, 'Mãe')
    .replace(/\bpais\b/gi, 'Pais')
    .replace(/\bavo\b/gi, 'Avô')
    .replace(/\bava\b/gi, 'Avó')
    .replace(/\bavos\b/gi, 'Avós')
    .replace(/\bneto\b/gi, 'Neto')
    .replace(/\bnetos\b/gi, 'Netos')
    .replace(/\bneta\b/gi, 'Neta')
    .replace(/\bnetas\b/gi, 'Netas')
    .replace(/\birmao\b/gi, 'Irmão')
    .replace(/\birmaos\b/gi, 'Irmãos')
    .replace(/\birma\b/gi, 'Irmã')
    .replace(/\birmas\b/gi, 'Irmãs')
    .replace(/\btio\b/gi, 'Tio')
    .replace(/\btios\b/gi, 'Tios')
    .replace(/\btia\b/gi, 'Tia')
    .replace(/\btias\b/gi, 'Tias')
    .replace(/\bsobrinho\b/gi, 'Sobrinho')
    .replace(/\bsobrinhos\b/gi, 'Sobrinhos')
    .replace(/\bsobrinha\b/gi, 'Sobrinha')
    .replace(/\bsobrinhas\b/gi, 'Sobrinhas')
    .replace(/\bprimo\b/gi, 'Primo')
    .replace(/\bprimos\b/gi, 'Primos')
    .replace(/\bprima\b/gi, 'Prima')
    .replace(/\bprimas\b/gi, 'Primas')
    .replace(/\bcunjado\b/gi, 'Cunhado')
    .replace(/\bcunhados\b/gi, 'Cunhados')
    .replace(/\bcunhada\b/gi, 'Cunhada')
    .replace(/\bcunhadas\b/gi, 'Cunhadas')
    .replace(/\bsogro\b/gi, 'Sogro')
    .replace(/\bsogros\b/gi, 'Sogros')
    .replace(/\bsogra\b/gi, 'Sogra')
    .replace(/\bsogras\b/gi, 'Sogras')
    .replace(/\bgenro\b/gi, 'Genro')
    .replace(/\bgenros\b/gi, 'Genros')
    .replace(/\bnora\b/gi, 'Nora')
    .replace(/\bnoras\b/gi, 'Noras')
    .replace(/\bpadrasto\b/gi, 'Padrasto')
    .replace(/\bpadrastos\b/gi, 'Padrastos')
    .replace(/\bmadrasta\b/gi, 'Madrasta')
    .replace(/\bmadrastas\b/gi, 'Madrastas')
    .replace(/\benteado\b/gi, 'Enteado')
    .replace(/\benteados\b/gi, 'Enteados')
    .replace(/\benteada\b/gi, 'Enteada')
    .replace(/\benteadas\b/gi, 'Enteadas')
    .replace(/\bmedio\b/gi, 'Médio')
    .replace(/\bmedia\b/gi, 'Média')
    .replace(/\bmedios\b/gi, 'Médios')
    .replace(/\bmedias\b/gi, 'Médias')
    .replace(/\bbasico\b/gi, 'Básico')
    .replace(/\bbasica\b/gi, 'Básica')
    .replace(/\bbasicos\b/gi, 'Básicos')
    .replace(/\bbasicas\b/gi, 'Básicas')
    .replace(/\bsuperior\b/gi, 'Superior')
    .replace(/\bsuperiores\b/gi, 'Superiores')
    .replace(/\btecnico\b/gi, 'Técnico')
    .replace(/\btecnica\b/gi, 'Técnica')
    .replace(/\btecnicos\b/gi, 'Técnicos')
    .replace(/\btecnicas\b/gi, 'Técnicas')
    .replace(/\btecnologo\b/gi, 'Tecnólogo')
    .replace(/\btecnologa\b/gi, 'Tecnóloga')
    .replace(/\btecnologos\b/gi, 'Tecnólogos')
    .replace(/\btecnologas\b/gi, 'Tecnólogas')
    .replace(/\bgraduacao\b/gi, 'Graduação')
    .replace(/\bgraduacoes\b/gi, 'Graduações')
    .replace(/\bpos\b/gi, 'Pós')
    .replace(/\bmestrado\b/gi, 'Mestrado')
    .replace(/\bmestrados\b/gi, 'Mestrados')
    .replace(/\bdoutorado\b/gi, 'Doutorado')
    .replace(/\bdoutorados\b/gi, 'Doutorados')
    .replace(/\bespecializacao\b/gi, 'Especialização')
    .replace(/\bespecializacoes\b/gi, 'Especializações')
    .replace(/\bmba\b/gi, 'MBA')
    .replace(/\bmbas\b/gi, 'MBAs')
    .replace(/\bcurso\b/gi, 'Curso')
    .replace(/\bcursos\b/gi, 'Cursos')
    .replace(/\btreinamento\b/gi, 'Treinamento')
    .replace(/\btreinamentos\b/gi, 'Treinamentos')
    .replace(/\bcapacitacao\b/gi, 'Capacitação')
    .replace(/\bcapacitacoes\b/gi, 'Capacitações')
    .replace(/\bqualificacao\b/gi, 'Qualificação')
    .replace(/\bqualificacoes\b/gi, 'Qualificações')
    .replace(/\bexperiencia\b/gi, 'Experiência')
    .replace(/\bexperiencias\b/gi, 'Experiências')
    .replace(/\bconhecimento\b/gi, 'Conhecimento')
    .replace(/\bconhecimentos\b/gi, 'Conhecimentos')
    .replace(/\bhabilidade\b/gi, 'Habilidade')
    .replace(/\bhabilidades\b/gi, 'Habilidades')
    .replace(/\bcompetencia\b/gi, 'Competência')
    .replace(/\bcompetencias\b/gi, 'Competências')
    // Fix common OCR/typing errors in the dataset
    .replace(/Tributacao/gi, 'Tributação')
    .replace(/Gestao/gi, 'Gestão')
    .replace(/Sucessao/gi, 'Sucessão')
    .replace(/Governanca/gi, 'Governança')
    .replace(/Estrategica/gi, 'Estratégica')
    .replace(/Praticos/gi, 'Práticos')
    .replace(/Experiancias/gi, 'Experiências') // Fix typo in data
    .replace(/conexoes/gi, 'Conexões')
    // Professions
    .replace(/Agronomo/gi, 'Agrônomo')
    .replace(/Veterinaria/gi, 'Veterinária')
    .replace(/Medica/gi, 'Médica')
    .replace(/Empresaria/gi, 'Empresária')
    .replace(/Ciencias Contabeis/gi, 'Ciências Contábeis')
    // Activities
    .replace(/Cafe/gi, 'Café')
    .replace(/Pecuaria/gi, 'Pecuária')
    .replace(/Cana-de-acucar/gi, 'Cana-de-açúcar')
    .replace(/Algodao/gi, 'Algodão')
    .replace(/Feijao/gi, 'Feijão')
    // Succession levels
    .replace(/Avancado - Ja atuo diretamente na sucessao/gi, 'Avançado - Já atuo diretamente na sucessão')
    .replace(/Iniciante - Quero entender conceitos basicos/gi, 'Iniciante - Quero entender conceitos básicos')
    .replace(/Intermediario - Ja vivencio o processo na pratica/gi, 'Intermediário - Já vivencio o processo na prática')
    // Experience levels
    .replace(/Mais de 10 anos/gi, 'Mais de 10 anos')
    .replace(/Entre 5 e 10 anos/gi, 'Entre 5 e 10 anos')
    .replace(/Entre 3 e 5 anos/gi, 'Entre 3 e 5 anos')
    .replace(/Entre 1 e 3 anos/gi, 'Entre 1 e 3 anos')
    .replace(/Menos de 1 ano/gi, 'Menos de 1 ano')
    // Normalize common variations
    .replace(/Agronegocio/gi, 'Agronegócio')
    .replace(/Familia/gi, 'Família')
    .replace(/familia/gi, 'família')
    // Fix specific data issues found in the dataset
    .replace(/família;/gi, 'familiar;')
    .replace(/Sucessão família/gi, 'Sucessão familiar')
    .replace(/familiarr/gi, 'familiar');
};

export const splitMultipleChoices = (value: string): string[] => {
  if (!value) return [];
  return value.split(';')
    .map(item => normalizeText(item))
    .filter(item => item);
};

export const getUniqueValues = (participants: ParticipantData[], field: keyof ParticipantData): string[] => {
  const values = new Set<string>();
  
  participants.forEach(participant => {
    const value = participant[field] as string;
    if (value) {
      if (field === 'profession' || field === 'activities' || field === 'objectives' || field === 'interests') {
        splitMultipleChoices(value).forEach(item => values.add(item));
      } else if (field === 'isClient') {
        // Transform client status to simplified form - only "Sim, ja/já sou cliente" counts as "Sim"
        const lowercaseValue = value.toLowerCase().trim();
        const isRealClient = lowercaseValue === 'sim, ja sou cliente' || 
                             lowercaseValue === 'sim, já sou cliente' ||
                             lowercaseValue === 'sim';
        const simplified = isRealClient ? 'Sim' : 'Não';
        values.add(simplified);
      } else {
        values.add(normalizeText(value));
      }
    }
  });
  
  return Array.from(values).sort();
};

export const calculateChartData = (participants: ParticipantData[], field: keyof ParticipantData) => {
  const counts: { [key: string]: number } = {};
  const TOTAL_DATASET = 55;

  participants.forEach(participant => {
    const value = participant[field] as string;
    if (value) {
      if (field === 'profession' || field === 'activities' || field === 'objectives' || field === 'interests') {
        splitMultipleChoices(value).forEach(item => {
          counts[item] = (counts[item] || 0) + 1;
        });
      } else if (field === 'isClient') {
        // Transform client status to simplified form - only "Sim, ja/já sou cliente" counts as "Sim"
        const lowercaseValue = value.toLowerCase().trim();
        const isRealClient = lowercaseValue === 'sim, ja sou cliente' || 
                             lowercaseValue === 'sim, já sou cliente' ||
                             lowercaseValue === 'sim';
        const simplified = isRealClient ? 'Sim' : 'Não';
        counts[simplified] = (counts[simplified] || 0) + 1;
      } else {
        const normalized = normalizeText(value);
        counts[normalized] = (counts[normalized] || 0) + 1;
      }
    }
  });

  return Object.entries(counts)
    .map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / TOTAL_DATASET) * 100)
    }))
    .sort((a, b) => b.value - a.value);
};

export const calculateCityDataWithState = (participants: ParticipantData[]) => {
  const cityStateMap: { [key: string]: { count: number; state: string } } = {};
  const TOTAL_DATASET = 55;

  participants.forEach(participant => {
    const city = normalizeText(participant.city);
    const state = normalizeText(participant.state);

    if (city && state && city !== '-' && state !== '-') {
      if (!cityStateMap[city]) {
        cityStateMap[city] = { count: 0, state };
      }
      cityStateMap[city].count += 1;
    }
  });

  return Object.entries(cityStateMap)
    .map(([city, data]) => ({
      name: `${city} (${data.state})`,
      value: data.count,
      percentage: Math.round((data.count / TOTAL_DATASET) * 100)
    }))
    .sort((a, b) => b.value - a.value);
};