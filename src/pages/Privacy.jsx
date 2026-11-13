import { FiLock } from 'react-icons/fi';
import PageSEO from '../components/PageSEO';

export default function Privacy() {
  return (
    <div className="bg-brand-gray-50 min-h-screen py-12">
      <PageSEO
        title="B2B Privacy Policy & Data Protection"
        description="4Core Exim B2B privacy policy: how we handle corporate buyer data, trade inquiries, and commercial information for pharmaceutical export operations."
        path="/privacy"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="bg-white border border-brand-gray-200 rounded-lg p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-2 text-brand-red-600 font-bold text-xs uppercase tracking-wider mb-2">
            <FiLock />
            <span>Commercial Confidentiality & Data Policy</span>
          </div>
          <h1 className="text-3xl font-bold text-brand-gray-900 tracking-tight">B2B Privacy Policy & Data Protection</h1>
          <p className="text-xs text-brand-gray-500 mt-2 font-mono">
            Document Reference: 4CE-PRIV-2026 | Effective Date: February 2026
          </p>
          <p className="text-xs text-brand-gray-700 mt-4 leading-relaxed font-medium">
            At <strong>4Core Exim</strong> (operated under Thakkar Medico Traders), we recognize the critical importance of commercial confidentiality, regulatory privacy, and data security when transacting international pharmaceutical wholesale operations.
          </p>
        </div>

        {/* Content Clauses */}
        <div className="bg-white border border-brand-gray-200 rounded-lg p-8 shadow-sm space-y-8 text-xs text-brand-gray-700 leading-relaxed font-normal">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wide border-b border-brand-gray-200 pb-2 mb-3">
              1. Information Collected in B2B Operations
            </h2>
            <p className="mb-2">
              We collect corporate and commercial data solely for verifying buyer credentials, issuing wholesale quotations, formulating proforma invoices, and managing customs shipping documentation. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-brand-gray-600">
              <li>Corporate entity name, registration number, and tax identification (GSTIN / VAT / TIN).</li>
              <li>Authorized corporate officer contact coordinates (Name, Business Email, Corporate Phone, WhatsApp desk).</li>
              <li>Destination jurisdiction, target sea/air discharge ports, and Incoterms requirements.</li>
              <li>Wholesale drug distribution licenses, import permits, and institutional tender specifications.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wide border-b border-brand-gray-200 pb-2 mb-3">
              2. Purpose and Legal Basis for Processing
            </h2>
            <p className="mb-2">
              Data provided to 4Core Exim is processed under the legal bases of contractual necessity, regulatory compliance, and legitimate commercial interests pursuant to the Indian Information Technology Act (2000) and international data privacy principles. Purposes include:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-brand-gray-600">
              <li>Generating accurate FOB/CIF wholesale price quotes and Minimum Order Quantity (MOQ) schedules.</li>
              <li>Preparing mandatory export clearance manifests, Certificates of Analysis (CoA), and Certificates of Origin (COO).</li>
              <li>Fulfilling Indian CDSCO, Customs, and DGFT statutory recordkeeping obligations.</li>
              <li>Communicating batch shipping schedules, airway bills, and cold-chain datalogger reports.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wide border-b border-brand-gray-200 pb-2 mb-3">
              3. Commercial Confidentiality & Non-Disclosure
            </h2>
            <p className="mb-2">
              3.1 <strong>Zero Third-Party Commercialization:</strong> We never sell, rent, monetize, or trade buyer databases, pricing negotiations, or purchase order volumes to any marketing third party.
            </p>
            <p className="mb-2">
              3.2 <strong>Authorized Disclosures:</strong> Information is disclosed strictly on a need-to-know basis to accredited logistics partners (freight forwarders, air cargo carriers, shipping lines), authorized customs brokers, banking institutions processing Letters of Credit (L/C), and statutory government inspectors.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wide border-b border-brand-gray-200 pb-2 mb-3">
              4. Technical Data Security & Retention
            </h2>
            <p className="mb-2">
              4.1 All digital communications, quotation databases, and regulatory files are safeguarded with encrypted network protocols, firewalled cloud infrastructure, and restricted administrative access.
            </p>
            <p className="mb-2">
              4.2 Export trade manifests and batch analysis records are retained in compliance with statutory pharmaceutical audit standards (typically 5 years from date of batch manufacture) to satisfy international recall traceability requirements.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wide border-b border-brand-gray-200 pb-2 mb-3">
              5. Cookies & Digital Tracking
            </h2>
            <p>
              Our web portal utilizes strictly necessary technical cookies and functional session variables to maintain catalog filters and product search performance. We do not operate intrusive tracking pixels or third-party behavioral advertising scripts.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wide border-b border-brand-gray-200 pb-2 mb-3">
              6. Data Officer Contact
            </h2>
            <p className="mb-2">
              For questions regarding our privacy practices, data access requests, or to update your corporate trade information, please contact our Compliance Officer:
            </p>
            <div className="bg-brand-gray-50 border border-brand-gray-200 rounded-md p-4 space-y-1">
              <p className="font-bold text-brand-gray-900">Compliance & Privacy Desk | 4Core Exim</p>
              <p className="text-brand-gray-600">Thakkar Medico Traders, Nagpur / Mumbai, Maharashtra, India</p>
              <p className="text-brand-gray-600">Email: <a href="mailto:privacy@4coreexim.com" className="text-brand-red-600 font-semibold hover:underline">privacy@4coreexim.com</a> / <a href="mailto:exports@4coreexim.com" className="text-brand-red-600 font-semibold hover:underline">exports@4coreexim.com</a></p>
              <p className="text-brand-gray-600">Phone: +91 93253 03018</p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
