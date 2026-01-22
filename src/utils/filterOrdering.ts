// Custom ordering for filter options

export const customFilterOrder = {
  region: ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"],
  age: ["Menos de 20 anos", "21 a 30 anos", "31 a 40 anos", "41 a 50 anos", "51 a 60 anos", "Mais de 60 anos"],
  successionLevel: ["Iniciante", "Intermediário", "Avançado"],
  experience: ["Menos de 2 anos", "2 a 5 anos", "6 a 10 anos", "Mais de 10 anos"]
};

// Map client status options to simplified "Sim"/"Não"
export const mapClientStatus = (status: string): string => {
  if (status.toLowerCase().includes('sim')) {
    return 'Sim';
  }
  return 'Não';
};

// Apply custom ordering to filter options
export const applyCustomOrder = (options: string[], field: keyof typeof customFilterOrder): string[] => {
  const order = customFilterOrder[field];
  if (!order) return options.sort();
  
  return order.filter(item => options.includes(item));
};

// Transform client status data for simplified display
export const transformClientData = (participants: any[]): string[] => {
  const statusSet = new Set<string>();
  participants.forEach(p => {
    if (p.isClient) {
      statusSet.add(mapClientStatus(p.isClient));
    }
  });
  return Array.from(statusSet).sort();
};