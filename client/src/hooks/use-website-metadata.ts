import { useState, useCallback } from 'react';

interface WebsiteMetadata {
  title?: string;
  favicon?: string;
  description?: string;
  isLoading: boolean;
  error?: string;
}

export function useWebsiteMetadata() {
  const [metadata, setMetadata] = useState<WebsiteMetadata>({ isLoading: false });

  const fetchMetadata = useCallback(async (url: string) => {
    if (!url || !isValidUrl(url)) {
      setMetadata({ isLoading: false });
      return;
    }

    setMetadata({ isLoading: true });

    try {
      // Extract domain for favicon
      const urlObj = new URL(url);
      const domain = urlObj.origin;
      const hostname = urlObj.hostname;
      
      // Try multiple favicon sources in order of preference
      const faviconSources = [
        `${domain}/favicon.ico`,
        `${domain}/apple-touch-icon.png`,
        `${domain}/apple-touch-icon-precomposed.png`,
        `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
        `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
        `https://favicons.githubusercontent.com/${hostname}`,
      ];
      
      const title = extractTitleFromUrl(url);
      let workingFavicon = null;
      
      // Test each favicon source
      for (const faviconUrl of faviconSources) {
        try {
          const response = await fetch(faviconUrl, { method: 'HEAD', mode: 'no-cors' });
          // For no-cors requests, we can't check status, so we'll try to load as image
          workingFavicon = faviconUrl;
          break;
        } catch {
          // Continue to next source
        }
      }
      
      // If no favicon found, use the first Google favicon as fallback
      if (!workingFavicon) {
        workingFavicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
      }
      
      setMetadata({
        title,
        favicon: workingFavicon,
        description: `Website: ${domain}`,
        isLoading: false
      });
      
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      setMetadata({
        isLoading: false,
        error: 'Failed to fetch website metadata'
      });
    }
  }, []);

  return { metadata, fetchMetadata };
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Remove www. if present
    const cleanHostname = hostname.replace(/^www\./, '');
    
    // Capitalize first letter of each part
    const parts = cleanHostname.split('.');
    const name = parts[0];
    
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return 'Website';
  }
}