import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UserFilters, PaginatedResponse, SortConfig, FilterPreset } from '@/types/admin';

export const useAdminUsers = () => {
  const [filters, setFilters] = useState<UserFilters>({});
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'created_at',
    direction: 'desc',
  });
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(filters.searchTerm);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.searchTerm]);

  // Load presets
  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const { data: presetsData, error: presetsError } = await supabase
        .from('admin_filter_presets')
        .select('*')
        .order('created_at', { ascending: false });

      if (presetsError) throw presetsError;
      setPresets((presetsData || []) as FilterPreset[]);
    } catch (err: any) {
      console.error('Error loading presets:', err);
    }
  };

  // Fetch users with filters
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const filtersForFetch = {
        ...filters,
        searchTerm: debouncedSearchTerm,
      };

      const { data: result, error: rpcError } = await supabase.rpc(
        'get_paginated_users',
        {
          page_number: currentPage,
          page_size: pageSize,
          filters: filtersForFetch as any,
          sort_by: sortConfig.column,
          sort_order: sortConfig.direction,
        }
      );

      if (rpcError) throw rpcError;

      if (result && typeof result === 'object') {
        setData(result as unknown as PaginatedResponse);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, debouncedSearchTerm, JSON.stringify({ ...filters, searchTerm: undefined }), JSON.stringify(sortConfig)]);

  // Filter management
  const updateFilter = (key: keyof UserFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const setAllFilters = (newFilters: UserFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= (data?.total_pages || 1)) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < (data?.total_pages || 1)) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Sorting
  const changeSorting = (column: SortConfig['column']) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Presets management
  const savePreset = async (presetName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('admin_filter_presets')
        .insert([{
          admin_user_id: user.id,
          preset_name: presetName,
          filters: filters as any,
        }]);

      if (error) throw error;
      await loadPresets();
    } catch (err: any) {
      console.error('Error saving preset:', err);
      throw err;
    }
  };

  const loadPreset = (preset: FilterPreset) => {
    setAllFilters(preset.filters);
  };

  const deletePreset = async (presetId: string) => {
    try {
      const { error } = await supabase
        .from('admin_filter_presets')
        .delete()
        .eq('id', presetId);

      if (error) throw error;
      await loadPresets();
    } catch (err: any) {
      console.error('Error deleting preset:', err);
      throw err;
    }
  };

  const activeFiltersCount = Object.entries(filters).filter(([_, value]) => {
    if (value === '' || value === undefined || value === null) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }).length;

  const refresh = () => {
    fetchUsers();
  };

  return {
    // Data
    users: data?.users || [],
    totalCount: data?.total_count || 0,
    totalPages: data?.total_pages || 0,
    
    // State
    filters,
    loading,
    error,
    currentPage,
    pageSize,
    sortConfig,
    presets,
    activeFiltersCount,
    
    // Filter actions
    updateFilter,
    clearFilters,
    setAllFilters,
    
    // Pagination actions
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    
    // Sorting actions
    changeSorting,
    
    // Preset actions
    savePreset,
    loadPreset,
    deletePreset,
    
    // Other
    refresh,
  };
};

