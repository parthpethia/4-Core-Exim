import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCompanyInfo } from '../services/productService';
import defaultCompany from '../data/company.json';

const CompanyContext = createContext(null);

/**
 * CompanyProvider — Fetches company data once and shares it app-wide.
 * Defaults to static fallback data from company.json so components
 * never crash on initial synchronous render.
 */
export function CompanyProvider({ children }) {
  const [company, setCompany] = useState(defaultCompany);
  const [loading, setLoading] = useState(true);

  const refreshCompany = useCallback(async () => {
    try {
      const data = await getCompanyInfo();
      if (data) {
        setCompany(data);
      }
    } catch (err) {
      console.warn('[4Core Exim] Failed to refresh company data:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadCompany() {
      try {
        const data = await getCompanyInfo();
        if (isMounted && data) {
          setCompany(data);
        }
      } catch (err) {
        console.warn('[4Core Exim] Failed to load company data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCompany();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <CompanyContext.Provider value={{ company: company || defaultCompany, loading, refreshCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

/**
 * Hook to access company data.
 * @returns {{ company: Object, loading: boolean, refreshCompany: Function }}
 */
export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return ctx;
}
