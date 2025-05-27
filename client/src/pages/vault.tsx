import { useState, useMemo } from 'react';
import { PasswordEntry } from '@shared/schema';
import { useVault } from '@/hooks/use-vault';
import { PinSetup } from '@/components/pin-setup';
import { PasswordCard } from '@/components/password-card';
import { PasswordModal } from '@/components/password-modal';
import { ShareModal } from '@/components/share-modal';
import { DeleteModal } from '@/components/delete-modal';
import { SettingsModal } from '@/components/settings-modal';
import { AdvancedSearch, SearchFilters } from '@/components/advanced-search';
import { PasswordAnalytics } from '@/components/password-analytics';
import { BulkActions } from '@/components/bulk-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { Shield, Search, Plus, Lock, Settings, BarChart3, Grid3x3 } from 'lucide-react';

export default function Vault() {
  const {
    isUnlocked,
    passwords,
    isLoading,
    hasExistingVault,
    currentUserId,
    createVault,
    unlockVault,
    lockVault,
    addPassword,
    updatePassword,
    deletePassword,
    copyToClipboard,
    changePIN,
    exportData,
    importData,
    clearVault,
  } = useVault();

  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | null>(null);
  const [activeTab, setActiveTab] = useState('passwords');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    dateRange: '',
    hasNotes: false,
    hasUrl: false,
    passwordStrength: ''
  });
  const [selectedPasswordIds, setSelectedPasswordIds] = useState<string[]>([]);

  // Filter passwords based on search query and filters
  const filteredPasswords = useMemo(() => {
    let filtered = passwords;
    
    // Apply search query
    const query = searchFilters.query || searchQuery;
    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(password => 
        password.serviceName.toLowerCase().includes(searchTerm) ||
        password.username.toLowerCase().includes(searchTerm) ||
        (password.url && password.url.toLowerCase().includes(searchTerm)) ||
        (password.notes && password.notes.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply advanced filters
    if (searchFilters.hasNotes) {
      filtered = filtered.filter(p => p.notes && p.notes.trim().length > 0);
    }
    
    if (searchFilters.hasUrl) {
      filtered = filtered.filter(p => p.url && p.url.trim().length > 0);
    }
    
    // Add more filter logic here as needed
    
    return filtered;
  }, [passwords, searchQuery, searchFilters]);

  // Show PIN setup if vault is locked
  if (!isUnlocked) {
    return (
      <PinSetup
        onCreateVault={createVault}
        onUnlockVault={unlockVault}
        hasExistingVault={hasExistingVault}
        isLoading={isLoading}
      />
    );
  }

  const handleAddPassword = () => {
    setEditingPassword(null);
    setShowPasswordModal(true);
  };

  const handleEditPassword = (password: PasswordEntry) => {
    setEditingPassword(password);
    setShowPasswordModal(true);
  };

  const handleSharePassword = (password: PasswordEntry) => {
    setSelectedPassword(password);
    setShowShareModal(true);
  };

  const handleDeletePassword = (password: PasswordEntry) => {
    setSelectedPassword(password);
    setShowDeleteModal(true);
  };

  const handleSavePassword = async (passwordData: any) => {
    if (editingPassword) {
      await updatePassword(editingPassword.id, passwordData);
    } else {
      await addPassword(passwordData);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedPassword) {
      deletePassword(selectedPassword.id);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    for (const id of ids) {
      await deletePassword(id);
    }
  };

  const handleBulkExport = (ids: string[]) => {
    const selectedPasswords = passwords.filter(p => ids.includes(p.id));
    const exportData = {
      passwords: selectedPasswords,
      exportDate: new Date().toISOString(),
      count: selectedPasswords.length
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passwords-bulk-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFilterChange = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setSearchQuery(filters.query);
  };

  const handleClearFilters = () => {
    setSearchFilters({
      query: '',
      category: '',
      dateRange: '',
      hasNotes: false,
      hasUrl: false,
      passwordStrength: ''
    });
    setSearchQuery('');
    setSelectedPasswordIds([]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground sm:p-4">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex-shrink-0">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <h1 className="text-sm sm:text-lg font-semibold truncate">DNVAULT</h1>
              <div className="hidden lg:flex items-center gap-2 text-sm text-slate-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Vault unlocked successfully</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              {/* Search Bar - Hidden on mobile, shown in a separate row */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search credentials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-input border-border text-foreground placeholder-muted-foreground focus:border-primary w-48 lg:w-64"
                />
              </div>
              
              {/* Advanced Search */}
              <div className="hidden lg:block">
                <AdvancedSearch
                  onFilter={handleFilterChange}
                  onClear={handleClearFilters}
                  activeFilters={searchFilters}
                />
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Add Password Button */}
              <Button
                onClick={handleAddPassword}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Password</span>
              </Button>
              
              
              
              {/* Settings Menu */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsModal(true)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white p-1 sm:p-2"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              
              {/* Lock Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={lockVault}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white p-1 sm:p-2"
              >
                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search credentials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-input border-border text-foreground placeholder-muted-foreground focus:border-primary w-full"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-6">
            <TabsTrigger value="passwords" className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4" />
              Passwords
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="passwords" className="space-y-6">
            {/* Advanced Search for Mobile */}
            <div className="lg:hidden">
              <AdvancedSearch
                onFilter={handleFilterChange}
                onClear={handleClearFilters}
                activeFilters={searchFilters}
              />
            </div>

            {/* Bulk Actions */}
            <BulkActions
              passwords={filteredPasswords}
              selectedIds={selectedPasswordIds}
              onSelectionChange={setSelectedPasswordIds}
              onBulkDelete={handleBulkDelete}
              onBulkExport={handleBulkExport}
            />
        {passwords.length === 0 ? (
          /* Empty State */
          <div className="text-center py-8 sm:py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full mb-4 sm:mb-6">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Your vault is empty</h3>
            <p className="text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base px-4">
              Add your first password entry to start building your secure vault. All passwords are encrypted with your PIN.
            </p>
            
            {/* Security Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                </div>
                <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">Secure Storage</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Client-side encryption using your PIN</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                </div>
                <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">PIN Protected</h4>
                <p className="text-xs sm:text-sm text-slate-400">Access your passwords securely</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">Easy Management</h4>
                <p className="text-xs sm:text-sm text-slate-400">Add, edit, and organize passwords</p>
              </div>
            </div>
            
            <Button
              onClick={handleAddPassword}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Password
            </Button>
          </div>
        ) : (
          /* Password Grid */
          <div>
            {/* Results Info */}
            <div className="mb-4 sm:mb-6 flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs sm:text-sm text-muted-foreground">
                {searchQuery ? (
                  <>Showing {filteredPasswords.length} of {passwords.length} passwords</>
                ) : (
                  <>{passwords.length} password{passwords.length !== 1 ? 's' : ''} in your vault</>
                )}
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="text-muted-foreground hover:text-foreground text-xs sm:text-sm"
                >
                  Clear search
                </Button>
              )}
            </div>

            {/* Password Cards Grid */}
            {filteredPasswords.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredPasswords.map((password) => (
                  <PasswordCard
                    key={password.id}
                    password={password}
                    onCopy={copyToClipboard}
                    onEdit={handleEditPassword}
                    onShare={handleSharePassword}
                    onDelete={handleDeletePassword}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 px-4">
                <Search className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2">No passwords found</h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  No passwords match your search for "{searchQuery}"
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 text-sm"
                >
                  Clear search
                </Button>
              </div>
            )}
          </div>
        )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <PasswordAnalytics passwords={passwords} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-3 sm:px-6 py-3 sm:py-4 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            <span className="text-center sm:text-left">Your passwords are encrypted and secure</span>
          </div>
          <div className="text-muted-foreground/60">© 2025 SecureVault</div>
        </div>
      </footer>

      {/* Modals */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSave={handleSavePassword}
        editingPassword={editingPassword}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        password={selectedPassword}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        password={selectedPassword}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        passwords={passwords}
        currentUserId={currentUserId}
        onExportData={exportData}
        onImportData={importData}
        onChangePIN={changePIN}
        onClearVault={clearVault}
      />
    </div>
  );
}
