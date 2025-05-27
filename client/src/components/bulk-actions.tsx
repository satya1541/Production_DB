
import { useState } from 'react';
import { PasswordEntry } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Upload, Edit, Share2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BulkActionsProps {
  passwords: PasswordEntry[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkExport: (ids: string[]) => void;
}

export function BulkActions({ 
  passwords, 
  selectedIds, 
  onSelectionChange, 
  onBulkDelete,
  onBulkExport 
}: BulkActionsProps) {
  const [isSelectMode, setIsSelectMode] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(passwords.map(p => p.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleToggleSelect = (passwordId: string) => {
    if (selectedIds.includes(passwordId)) {
      onSelectionChange(selectedIds.filter(id => id !== passwordId));
    } else {
      onSelectionChange([...selectedIds, passwordId]);
    }
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    onSelectionChange([]);
  };

  const selectedCount = selectedIds.length;
  const allSelected = selectedIds.length === passwords.length && passwords.length > 0;

  if (passwords.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Bulk Actions Header */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-3">
          <Button
            variant={isSelectMode ? "default" : "outline"}
            size="sm"
            onClick={toggleSelectMode}
          >
            {isSelectMode ? "Cancel Selection" : "Select Multiple"}
          </Button>
          
          {isSelectMode && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm cursor-pointer">
                Select All
              </label>
              {selectedCount > 0 && (
                <Badge variant="secondary">
                  {selectedCount} selected
                </Badge>
              )}
            </div>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkExport(selectedIds)}
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete ({selectedCount})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selected Passwords</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedCount} password{selectedCount !== 1 ? 's' : ''}? 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onBulkDelete(selectedIds);
                      onSelectionChange([]);
                      setIsSelectMode(false);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Selection Checkboxes for each password */}
      {isSelectMode && (
        <div className="grid gap-2">
          {passwords.map(password => (
            <div
              key={password.id}
              className="flex items-center gap-3 p-2 rounded border hover:bg-muted/50"
            >
              <Checkbox
                checked={selectedIds.includes(password.id)}
                onCheckedChange={() => handleToggleSelect(password.id)}
                id={`select-${password.id}`}
              />
              <label 
                htmlFor={`select-${password.id}`}
                className="flex-1 cursor-pointer text-sm"
              >
                <span className="font-medium">{password.serviceName}</span>
                <span className="text-muted-foreground ml-2">({password.username})</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
