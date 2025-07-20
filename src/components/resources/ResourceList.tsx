
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Resource, Kit, Language } from '@/types';
import ResourceCard from './ResourceCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ResourceListProps {
  kitId?: string;
}

const ResourceList: React.FC<ResourceListProps> = ({ kitId }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [kits, setKits] = useState<Kit[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [filters, setFilters] = useState({
    kitId: kitId || '',
    languageId: '',
    resourceType: '',
    searchQuery: '',
  });
  
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      
      try {
        let query = supabase
          .from('resources')
          .select('*')
          .eq('is_active', true);
        
        if (filters.kitId) {
          query = query.eq('kit_id', filters.kitId);
        }
        
        if (filters.languageId) {
          query = query.eq('language_id', filters.languageId);
        }
        
        if (filters.resourceType) {
          query = query.eq('resource_type', filters.resourceType);
        }
        
        if (filters.searchQuery) {
          query = query.ilike('title', `%${filters.searchQuery}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setResources(data || []);
      } catch (error: any) {
        toast.error(`Error fetching resources: ${error.message}`);
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchKits = async () => {
      try {
        const { data, error } = await supabase
          .from('kits')
          .select('*')
          .eq('is_active', true);
        
        if (error) {
          throw error;
        }
        
        setKits(data || []);
      } catch (error: any) {
        console.error('Error fetching kits:', error);
      }
    };
    
    const fetchLanguages = async () => {
      try {
        const { data, error } = await supabase
          .from('languages')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        setLanguages(data || []);
      } catch (error: any) {
        console.error('Error fetching languages:', error);
      }
    };
    
    fetchResources();
    fetchKits();
    fetchLanguages();
  }, [filters, kitId]);
  
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {!kitId && (
          <div>
            <Label htmlFor="kit-filter">Filter by Kit</Label>
            <Select
              value={filters.kitId}
              onValueChange={(value) => handleFilterChange('kitId', value)}
            >
              <SelectTrigger id="kit-filter">
                <SelectValue placeholder="All Kits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Kits</SelectItem>
                {kits.map((kit) => (
                  <SelectItem key={kit.id} value={kit.id}>
                    {kit.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div>
          <Label htmlFor="language-filter">Filter by Language</Label>
          <Select
            value={filters.languageId}
            onValueChange={(value) => handleFilterChange('languageId', value)}
          >
            <SelectTrigger id="language-filter">
              <SelectValue placeholder="All Languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Languages</SelectItem>
              {languages.map((language) => (
                <SelectItem key={language.id} value={language.id}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="type-filter">Filter by Type</Label>
          <Select
            value={filters.resourceType}
            onValueChange={(value) => handleFilterChange('resourceType', value)}
          >
            <SelectTrigger id="type-filter">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="pdf">PDF Documents</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search resources..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="text-center py-8">
          No resources found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceList;