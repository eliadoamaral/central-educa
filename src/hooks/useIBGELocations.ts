import { useState, useEffect } from "react";

interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

interface IBGECity {
  id: number;
  nome: string;
}

export interface StateOption {
  value: string;
  label: string;
}

export interface CityOption {
  value: string;
  label: string;
}

export function useIBGELocations(selectedState: string) {
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Fetch states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setIsLoadingStates(true);
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
        );
        const data: IBGEState[] = await response.json();
        
        const stateOptions = data.map((state) => ({
          value: state.sigla,
          label: `${state.sigla} - ${state.nome}`,
        }));
        
        setStates(stateOptions);
      } catch (error) {
        console.error("Error fetching states:", error);
      } finally {
        setIsLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      try {
        setIsLoadingCities(true);
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`
        );
        const data: IBGECity[] = await response.json();
        
        const cityOptions = data.map((city) => ({
          value: city.nome,
          label: city.nome,
        }));
        
        setCities(cityOptions);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedState]);

  return {
    states,
    cities,
    isLoadingStates,
    isLoadingCities,
  };
}
