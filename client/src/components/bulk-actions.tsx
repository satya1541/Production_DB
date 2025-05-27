
import { useState } from 'react';
import { PasswordEntry } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Upload, Edit, Share2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();

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
      <div className={`p-3 bg-muted rounded-lg ${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
        <div className={`${isMobile ? 'space-y-3' : 'flex items-center gap-3'}`}>
          <Button
            variant={isSelectMode ? "default" : "outline"}
            size={isMobile ? "default" : "sm"}
            onClick={toggleSelectMode}
            className={isMobile ? "w-full" : ""}
          >
            {isSelectMode ? "Cancel Selection" : "Select Multiple"}
          </Button>
          
          {isSelectMode && (
            <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex items-center gap-2'}`}>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-sm cursor-pointer">
                  Select All
                </label>
              </div>
              {selectedCount > 0 && (
                <Badge variant="secondary" className={isMobile ? "self-start" : ""}>
                  {selectedCount} selected
                </Badge>
              )}
            </div>
          )}
        </div>

        {selectedCount > 0 && (
          <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex items-center gap-2'}`}>
            <Button
              variant="outline"
              size={isMobile ? "default" : "sm"}
              onClick={() => onBulkExport(selectedIds)}
              className={isMobile ? "w-full" : ""}
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size={isMobile ? "default" : "sm"}
                  className={isMobile ? "w-full" : ""}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete ({selectedCount})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className={isMobile ? "mx-4 max-w-[calc(100vw-2rem)]" : ""}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selected Passwords</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedCount} password{selectedCount !== 1 ? 's' : ''}? 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className={isMobile ? "flex-col gap-2" : ""}>
                  <AlertDialogCancel className={isMobile ? "w-full" : ""}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onBulkDelete(selectedIds);
                      onSelectionChange([]);
                      setIsSelectMode(false);
                    }}
                    className={`bg-destructive text-destructive-foreground hover:bg-destructive/90 ${isMobile ? "w-full" : ""}`}
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
              className="flex items-center gap-3 p-3 rounded border hover:bg-muted/50"
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
                <div className={isMobile ? "flex flex-col gap-1" : "flex items-center gap-2"}>
                  <span className="font-medium">{password.serviceName}</span>
                  <span className="text-muted-foreground">({password.username})</span>
                </div>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
