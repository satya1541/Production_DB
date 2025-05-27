import { useState, useEffect, useCallback } from 'react';
import { PasswordEntry, InsertPasswordEntry, Vault } from '@shared/schema';
import { encryptData, decryptData, hashPin } from '@/lib/crypto';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Use a default username for database storage
const DEFAULT_USERNAME = 'user';

export function useVault() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPin, setCurrentPin] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [hasExistingVault, setHasExistingVault] = useState(false);
  const { toast } = useToast();

  // Check if vault exists in database
  const checkVaultExists = useCallback(async () => {
    try {
      const userRes = await apiRequest('GET', `/api/users/${DEFAULT_USERNAME}`);
      const user = await userRes.json();
      if (user) {
        const vaultRes = await apiRequest('GET', `/api/vault/${user.id}/exists`);
        const vaultExists = await vaultRes.json();
        setHasExistingVault(vaultExists.exists);
        return vaultExists.exists;
      }
      setHasExistingVault(false);
      return false;
    } catch {
      setHasExistingVault(false);
      return false;
    }
  }, []);

  // Create new vault with PIN
  const createVault = useCallback(async (pin: string) => {
    try {
      setIsLoading(true);
      
      // Hash PIN for verification
      const pinHash = await hashPin(pin);
      
      // Create user in database
      const userRes = await apiRequest('POST', '/api/users', {
        username: DEFAULT_USERNAME,
        pinHash: pinHash
      });
      const user = await userRes.json();
      
      // Encrypt empty password array
      const emptyData = JSON.stringify([]);
      const encryptedVault = await encryptData(emptyData, pin);
      
      // Save vault to database
      await apiRequest('POST', '/api/vault', {
        userId: user.id,
        encryptedData: encryptedVault.encryptedData,
        salt: encryptedVault.salt,
        iv: encryptedVault.iv
      });
      
      setCurrentUserId(user.id);
      setCurrentPin(pin);
      setIsUnlocked(true);
      setPasswords([]);
      setHasExistingVault(true);
      
      toast({
        title: "Vault Created",
        description: "Your secure vault has been created successfully.",
      });
      
    } catch (error) {
      console.error('Failed to create vault:', error);
      toast({
        title: "Error",
        description: "Failed to create vault. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Unlock vault with PIN
  const unlockVault = useCallback(async (pin: string) => {
    try {
      setIsLoading(true);
      
      // Get user from database
      const userRes = await apiRequest('GET', `/api/users/${DEFAULT_USERNAME}`);
      const user = await userRes.json();
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verify PIN
      const pinHash = await hashPin(pin);
      console.log('PIN verification:', { pinHash, userPinHash: user.pinHash });
      if (pinHash !== user.pinHash) {
        throw new Error('Invalid PIN');
      }
      
      // Get vault from database
      const vaultRes = await apiRequest('GET', `/api/vault/${user.id}`);
      const vault = await vaultRes.json();
      if (!vault) {
        throw new Error('Vault not found');
      }
      
      // Decrypt vault data
      const decryptedData = await decryptData(
        vault.encryptedData,
        pin,
        vault.salt,
        vault.iv
      );
      
      const passwordData = JSON.parse(decryptedData);
      
      setCurrentUserId(user.id);
      setCurrentPin(pin);
      setIsUnlocked(true);
      setPasswords(passwordData);
      
      toast({
        title: "Vault Unlocked",
        description: "Welcome back to your secure vault.",
      });
      
      return true;
    } catch (error) {
      console.error('Failed to unlock vault:', error);
      toast({
        title: "Error",
        description: "Invalid PIN. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Save vault data to database
  const saveVaultToDatabase = useCallback(async (passwordData: PasswordEntry[]) => {
    if (!currentUserId || !currentPin) return;
    
    try {
      const dataToEncrypt = JSON.stringify(passwordData);
      const encryptedVault = await encryptData(dataToEncrypt, currentPin);
      
      await apiRequest('POST', '/api/vault', {
        userId: currentUserId,
        encryptedData: encryptedVault.encryptedData,
        salt: encryptedVault.salt,
        iv: encryptedVault.iv
      });
    } catch (error) {
      console.error('Failed to save vault:', error);
      toast({
        title: "Error",
        description: "Failed to save vault data.",
        variant: "destructive",
      });
    }
  }, [currentUserId, currentPin, toast]);

  const addPassword = useCallback(async (passwordData: InsertPasswordEntry) => {
    const newPassword: PasswordEntry = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...passwordData,
    };
    
    const updatedPasswords = [...passwords, newPassword];
    setPasswords(updatedPasswords);
    await saveVaultToDatabase(updatedPasswords);
    
    toast({
      title: "Password Added",
      description: `Password for ${passwordData.serviceName} has been saved securely.`,
    });
  }, [passwords, saveVaultToDatabase, toast]);

  const updatePassword = useCallback(async (id: string, passwordData: InsertPasswordEntry) => {
    const updatedPasswords = passwords.map(p => 
      p.id === id 
        ? { ...p, ...passwordData, updatedAt: Date.now() }
        : p
    );
    setPasswords(updatedPasswords);
    await saveVaultToDatabase(updatedPasswords);
    
    toast({
      title: "Password Updated",
      description: `Password for ${passwordData.serviceName} has been updated.`,
    });
  }, [passwords, saveVaultToDatabase, toast]);

  const deletePassword = useCallback(async (id: string) => {
    const updatedPasswords = passwords.filter(p => p.id !== id);
    setPasswords(updatedPasswords);
    await saveVaultToDatabase(updatedPasswords);
    
    toast({
      title: "Password Deleted",
      description: "Password has been removed from your vault.",
    });
  }, [passwords, saveVaultToDatabase, toast]);

  const lockVault = useCallback(() => {
    setIsUnlocked(false);
    setPasswords([]);
    setCurrentPin('');
    setCurrentUserId(null);
  }, []);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  }, [toast]);

  const changePIN = useCallback(async (oldPin: string, newPin: string) => {
    if (!currentUserId) throw new Error('No user session');
    
    try {
      // Verify old PIN
      const userRes = await apiRequest('GET', `/api/users/${DEFAULT_USERNAME}`);
      const user = await userRes.json();
      const oldPinHash = await hashPin(oldPin);
      
      if (oldPinHash !== user.pinHash) {
        throw new Error('Invalid current PIN');
      }
      
      // Get current vault data
      const vaultRes = await apiRequest('GET', `/api/vault/${user.id}`);
      const vault = await vaultRes.json();
      
      // Decrypt with old PIN
      const decryptedData = await decryptData(
        vault.encryptedData,
        oldPin,
        vault.salt,
        vault.iv
      );
      
      // Re-encrypt with new PIN
      const newEncryptedVault = await encryptData(decryptedData, newPin);
      const newPinHash = await hashPin(newPin);
      
      // Update user PIN hash
      await apiRequest('POST', '/api/users', {
        username: DEFAULT_USERNAME,
        pinHash: newPinHash
      });
      
      // Update vault with new encryption
      await apiRequest('POST', '/api/vault', {
        userId: user.id,
        encryptedData: newEncryptedVault.encryptedData,
        salt: newEncryptedVault.salt,
        iv: newEncryptedVault.iv
      });
      
      setCurrentPin(newPin);
      
    } catch (error) {
      console.error('Failed to change PIN:', error);
      throw error;
    }
  }, [currentUserId]);

  const exportData = useCallback(() => {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      passwords: passwords,
      metadata: {
        totalPasswords: passwords.length,
        exportedBy: 'SecureVault'
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `securevault-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Your vault data has been exported successfully",
    });
  }, [passwords, toast]);

  const importData = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.passwords || !Array.isArray(importData.passwords)) {
        throw new Error('Invalid backup file format');
      }
      
      // Merge imported passwords with existing ones
      const existingIds = new Set(passwords.map(p => p.id));
      const newPasswords = importData.passwords.filter((p: any) => !existingIds.has(p.id));
      const updatedPasswords = [...passwords, ...newPasswords];
      
      setPasswords(updatedPasswords);
      await saveVaultToDatabase(updatedPasswords);
      
      toast({
        title: "Import Complete",
        description: `Imported ${newPasswords.length} new passwords`,
      });
      
    } catch (error) {
      console.error('Failed to import data:', error);
      toast({
        title: "Import Failed",
        description: "Invalid backup file or format error",
        variant: "destructive",
      });
    }
  }, [passwords, saveVaultToDatabase, toast]);

  const clearVault = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      // Clear passwords locally
      setPasswords([]);
      
      // Save empty vault to database
      await saveVaultToDatabase([]);
      
    } catch (error) {
      console.error('Failed to clear vault:', error);
      throw error;
    }
  }, [currentUserId, saveVaultToDatabase]);

  // Check for existing vault on mount
  useEffect(() => {
    checkVaultExists();
  }, [checkVaultExists]);

  return {
    isUnlocked,
    passwords,
    isLoading,
    hasExistingVault,
    currentUserId,
    createVault,
    unlockVault,
    addPassword,
    updatePassword,
    deletePassword,
    lockVault,
    copyToClipboard,
    changePIN,
    exportData,
    importData,
    clearVault,
    checkVaultExists,
  };
}