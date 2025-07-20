
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Kit, UserAccess, GradeLevel } from '@/types';
import KitCard from './KitCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface KitListProps {
  grade?: GradeLevel;
  limit?: number;
  showOnlyAccessible?: boolean;
}

const KitList: React.FC<KitListProps> = ({ 
  grade, 
  limit,
  showOnlyAccessible = false
}) => {
  const { user } = useAuth();
  const [kits, setKits] = useState<Kit[]>([]);
  const [userAccess, setUserAccess] = useState<Record<string, UserAccess>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedGrade, setSelectedGrade] = useState<string | null>(grade || null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchKits = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('kits')
          .select('*')
          .eq('is_active', true);
        
        // Apply filters
        if (selectedGrade) {
          query = query.eq('grade', selectedGrade);
        }
        
        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }
        
        // Apply limit if specified
        if (limit) {
          query = query.limit(limit);
        }
        
        // Order by title
        query = query.order('title');
        
        const { data, error: kitsError } = await query;
        
        if (kitsError) throw kitsError;
        
        // If user is logged in, fetch their access
        if (user) {
          const { data: accessData, error: accessError } = await supabase
            .from('user_access')
            .select('*')
            .eq('user_id', user.id)
            .in('kit_id', data.map((kit: Kit) => kit.id));
          
          if (accessError) throw accessError;
          
          // Create a map of kit_id to access
          const accessMap: Record<string, UserAccess> = {};
          accessData.forEach((access: UserAccess) => {
            accessMap[access.kit_id] = access;
          });
          
          setUserAccess(accessMap);
        }
        
        // If showOnlyAccessible is true, filter kits to only those the user has access to
        if (showOnlyAccessible && user) {
          const filteredKits = data.filter((kit: Kit) => 
            Object.keys(userAccess).includes(kit.id)
          );
          setKits(filteredKits as Kit[]);
        } else {
          setKits(data as Kit[]);
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchKits();
  }, [selectedGrade, searchQuery, limit, user, showOnlyAccessible, userAccess]);

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search kits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="grade">Grade</Label>
            <Select
              value={selectedGrade || 'all-grades'}
              onValueChange={(value) => setSelectedGrade(value === 'all-grades' ? null : value)}
            >
              <SelectTrigger id="grade">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-grades">All Grades</SelectItem>
                <SelectItem value="6">Grade 6</SelectItem>
                <SelectItem value="7">Grade 7</SelectItem>
                <SelectItem value="8">Grade 8</SelectItem>
                <SelectItem value="9">Grade 9</SelectItem>
                <SelectItem value="10">Grade 10</SelectItem>
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
      ) : kits.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <p className="text-gray-500">No kits found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {kits.map((kit) => (
            <KitCard 
              key={kit.id} 
              kit={kit} 
              hasAccess={!!userAccess[kit.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default KitList;