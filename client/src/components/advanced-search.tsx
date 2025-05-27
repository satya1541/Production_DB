
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface AdvancedSearchProps {
  onFilter: (filters: SearchFilters) => void;
  onClear: () => void;
  activeFilters: SearchFilters;
}

export interface SearchFilters {
  query: string;
  category: string;
  dateRange: string;
  hasNotes: boolean;
  hasUrl: boolean;
  passwordStrength: string;
}

export function AdvancedSearch({ onFilter, onClear, activeFilters }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(activeFilters);

  const handleApply = () => {
    onFilter(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      category: '',
      dateRange: '',
      hasNotes: false,
      hasUrl: false,
      passwordStrength: ''
    };
    setFilters(clearedFilters);
    onClear();
    setIsOpen(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.query) count++;
    if (activeFilters.category) count++;
    if (activeFilters.dateRange) count++;
    if (activeFilters.hasNotes) count++;
    if (activeFilters.hasUrl) count++;
    if (activeFilters.passwordStrength) count++;
    return count;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="w-5 h-5 mr-3 text-muted-foreground" />
          Advanced Search
          {getActiveFilterCount() > 0 && (
            <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-query">Search Query</Label>
            <Input
              id="search-query"
              placeholder="Search in name, username, URL, notes..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="banking">Banking</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Added</Label>
            <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Password Strength</Label>
            <Select value={filters.passwordStrength} onValueChange={(value) => setFilters({ ...filters, passwordStrength: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Any strength" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any strength</SelectItem>
                <SelectItem value="weak">Weak</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="very-strong">Very Strong</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Additional Filters</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.hasNotes}
                  onChange={(e) => setFilters({ ...filters, hasNotes: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Has notes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.hasUrl}
                  onChange={(e) => setFilters({ ...filters, hasUrl: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Has website URL</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
