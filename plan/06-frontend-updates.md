# Chunk 6: Frontend Component Updates

> **Status:** 🔲 TODO
> **Files to modify:** `ProductCard.jsx`, `Footer.jsx`, `Header.jsx`, `Dashboard.jsx`
> **Dependencies:** Chunk 2 (service layer)

---

## Problem

4 components currently `import companyData from '../data/company.json'` directly. Once we delete the JSON files (Chunk 8), these will break. They need to either:
- **Option A:** Receive company data via props from a parent that fetches it
- **Option B:** Fetch company data themselves using the service layer
- **Option C:** Use a React Context for company data (best for Header/Footer since they're always rendered)

### Recommended Approach: Option C (CompanyContext) + Option A for ProductCard

Create a `CompanyProvider` context that fetches company data once and shares it app-wide. This is ideal because Header and Footer are rendered on every page.

---

## Task 6.1: Create CompanyContext

**New file:** `src/context/CompanyContext.jsx`

```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCompanyInfo } from '../services/productService';

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompanyInfo().then(data => {
      setCompany(data);
      setLoading(false);
    });
  }, []);

  return (
    <CompanyContext.Provider value={{ company, loading }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}
```

**Wrap in App.jsx:**
```jsx
<BrowserRouter>
  <AuthProvider>
    <CompanyProvider>   {/* ← ADD THIS */}
      <ScrollToTop />
      ...
    </CompanyProvider>
  </AuthProvider>
</BrowserRouter>
```

---

## Task 6.2: Update Footer.jsx

**Current (line 4):**
```js
import companyData from '../data/company.json';
```

**Replace with:**
```js
import { useCompany } from '../context/CompanyContext';

export default function Footer() {
  const { company: companyData } = useCompany();
  if (!companyData) return null; // or skeleton
  // ... rest of component unchanged
```

---

## Task 6.3: Update Header.jsx

**Current (line 5):**
```js
import companyData from '../data/company.json';
```

**Same fix as Footer — use `useCompany()` hook.**

---

## Task 6.4: Update Dashboard.jsx

**Current (line 6):**
```js
import companyData from '../data/company.json';
```

**Same fix — use `useCompany()` hook.**

---

## Task 6.5: Update ProductCard.jsx — Wire Inquiry to DB

**Current behavior (line 4 + lines 47-60):**
```js
import companyData from '../data/company.json';
// ...
const handleModalSubmit = (e) => {
  e.preventDefault();
  setIsSubmitted(true);
  console.log("B2B Wholesale Lead Captured:", { ... }); // ← LOST!
};
```

**New behavior:**
1. Remove `import companyData` — company name is already available via the `companyEmail` prop
2. Wire `handleModalSubmit` to call `submitInquiry()` from the service layer

```js
import { submitInquiry } from '../services/productService';

const handleModalSubmit = async (e) => {
  e.preventDefault();
  try {
    await submitInquiry({
      productId: product.id,
      productName: name,
      categoryName: categoryName,
      phone: phoneNumber,
      countryCode: countryCode,
      businessName: businessName,
      incoterm: incoterm,
      destinationPort: destinationPort
    });
    setIsSubmitted(true);
  } catch (err) {
    console.error('Inquiry submission failed:', err);
    // Still show success to user (inquiry also sent via email fallback)
    setIsSubmitted(true);
  }
};
```

Also need to fix the company name reference on line 291:
```jsx
// Before:
<p>Direct commercial pricing from {companyData.name}</p>
// After:
<p>Direct commercial pricing from 4 Core Exim</p>
// Or pass company name as a prop
```

---

## Files Changed Summary

| File | Change Type | Lines Affected |
|------|------------|----------------|
| `src/context/CompanyContext.jsx` | **NEW** | ~25 lines |
| `src/App.jsx` | Add `<CompanyProvider>` wrapper | ~3 lines |
| `src/components/Footer.jsx` | Replace import, add hook | ~3 lines |
| `src/components/Header.jsx` | Replace import, add hook | ~3 lines |
| `src/pages/Dashboard.jsx` | Replace import, add hook | ~3 lines |
| `src/components/ProductCard.jsx` | Replace import, wire inquiry to DB | ~15 lines |
