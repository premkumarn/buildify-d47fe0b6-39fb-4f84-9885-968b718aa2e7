
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Resource, Kit, Language } from '@/types';
import ResourceCard from './ResourceCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ResourceListProps {
  kitId?: string;
  languageId?: string;
  resourceType?: string;
  limit?: number;
  searchQuery?: string;
  showAccessStatus?: boolean;
}

const ResourceList: React.FC<ResourceListProps> = ({ 
  kitId, 
  languageId, 
  resourceType,
  limit,
  searchQuery = '',
  showAccessStatus = false
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedKitId, setSelectedKitId] = useState<string | null>(kitId || null);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(languageId || null);
  const [selectedResourceType, setSelectedResourceType] = useState<string | null>(resourceType || null);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Use the prop searchQuery if provided, otherwise use local state
  const effectiveSearchQuery = searchQuery !== undefined ? searchQuery : localSearchQuery;

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetch kits
        const { data: kitsData, error: kitsError } = await supabase
          .from('kits')
          .select('*')
          .eq('is_active', true);
        
        if (kitsError) throw kitsError;
        
        // Fetch languages
        const { data: languagesData, error: languagesError } = await supabase
          .from('languages')
          .select('*');
        
        if (languagesError) throw languagesError;
        
        setKits(kitsData as Kit[]);
        setLanguages(languagesData as Language[]);
      } catch (error: any) {
        setError(error.message);
      }
    };
    
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('resources')
          .select(`
            *,
            languages (*)
          `)
          .eq('is_active', true);
        
        // Apply filters
        if (selectedKitId) {
          query = query.eq('kit_id', selectedKitId);
        }
        
        if (selectedLanguageId) {
          query = query.eq('language_id', selectedLanguageId);
        }
        
        if (selectedResourceType) {
          query = query.eq('resource_type', selectedResourceType);
        }
        
        if (effectiveSearchQuery) {
          query = query.ilike('title', `%${effectiveSearchQuery}%`);
        }
        
        // Apply limit if specified
        if (limit) {
          query = query.limit(limit);
        }
        
        // Order by most recent
        query = query.order('created_at', { ascending: false });
        
        const { data, error: resourcesError } = await query;
        
        if (resourcesError) throw resourcesError;
        
        setResources(data as Resource[]);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, [selectedKitId, selectedLanguageId, selectedResourceType, effectiveSearchQuery, limit]);

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {searchQuery === undefined && (
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search resources..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="kit">Kit</Label>
            <Select
              value={selectedKitId || 'all-kits'}
              onValueChange={(value) => setSelectedKitId(value === 'all-kits' ? null : value)}
            >
              <SelectTrigger id="kit">
                <SelectValue placeholder="All Kits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-kits">All Kits</SelectItem>
                {kits.map((kit) => (
                  <SelectItem key={kit.id} value={kit.id}>
                    {kit.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="language">Language</Label>
            <Select
              value={selectedLanguageId || 'all-languages'}
              onValueChange={(value) => setSelectedLanguageId(value === 'all-languages' ? null : value)}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-languages">All Languages</SelectItem>
                {languages.map((language) => (
                  <SelectItem key={language.id} value={language.id}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="type">Type</Label>
            <Select
              value={selectedResourceType || 'all-types'}
              onValueChange={(value) => setSelectedResourceType(value === 'all-types' ? null : value)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All Types</SelectItem>
                <SelectItem value="pdf">PDF Documents</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <p className="text-gray-500">No resources found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {resources.map((resource) => (
            <ResourceCard 
              key={resource.id} 
              resource={resource} 
              showAccessStatus={showAccessStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceList;