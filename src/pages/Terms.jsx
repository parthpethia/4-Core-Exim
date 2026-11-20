import { FiFileText, FiAlertCircle } from 'react-icons/fi';
import PageSEO from '../components/PageSEO';

export default function Terms() {
  return (
    <div className="bg-brand-gray-50 min-h-screen py-12">
      <PageSEO
        title="Terms of Export Service & Commercial Supply"
        description="4Core Exim terms of export service: wholesale pharmaceutical supply, Incoterms, payment terms, shipping, and B2B commercial conditions for international buyers."
        path="/terms"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="bg-white border border-brand-gray-200 rounded-lg p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-2 text-brand-green-600 font-bold text-xs uppercase tracking-wider mb-2">
            <FiFileText />
            <span>Legal & Export Contractual Terms</span>
          </div>
          <h1 className="text-3xl font-bold text-brand-gray-900 tracking-tight">Terms of Export Service & Commercial Supply</h1>
          <p className="text-xs text-brand-gray-500 mt-2 font-mono">
            Document Reference: 4CE-TOS-2026 | Last Revised: February 2026
          </p>
          <p className="text-xs text-brand-gray-700 mt-4 leading-relaxed font-medium">
            These terms govern all wholesale pharmaceutical quotations, proforma invoices, export contracts, and consignments fulfilled by <strong>4Core Exim</strong>, registered in Nagpur and Mumbai, Maharashtra, India.
          </p>
        </div>

        {/* Content Clauses */}
        <div className="bg-white border border-brand-gray-200 rounded-lg p-8 shadow-sm space-y-8 text-xs text-brand-gray-700 leading-relaxed font-normal">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wide border-b border-brand-gray-200 pb-2 mb-3">
              1. Regulatory Sourcing & Compliance Standards
            </h2>
            <p className="mb-2">
              1.1 All pharmaceutical formulations supplied by 4Core Exim are sourced exclusively from licensed manufacturing facilities in India adhering to WHO-GMP (Good Manufacturing Practices), EU-GMP, or US-FDA regulatory standards.
            </p>
            <p className="mb-2">
              1.2 Products are dispatched in compliance with the provisions of the Indian Drugs and Cosmetics Act (1940), the Central Drugs Standard Control Organisation (CDSCO) export rules, and relevant Directorate General of Foreign Trade (DGFT) guidelines.
            </p>
            <p>
              1.3 Every dispatched commercial lot is accompanied by an authentic manufacturer Certificate of Analysis (CoA), Stability Confirmation Sheet, and valid Batch Manufacturing Records as requested.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wide border-b border-brand-gray-200 pb-2 mb-3">
              2. B2B Wholesale Exclusivity & Customer Warranty
            </h2>
            <p className="mb-2">
              2.1 4Core Exim conducts business strictly on a B2B (Business-to-Business) wholesale and institutional supply basis. We do not retail, dispense individual prescriptions, or engage in direct-to-consumer online pharmacies.
            </p>
            <p>
              2.2 The purchasing entity warrants that it holds valid corporate registration, wholesale drug distribution licenses, and appropriate import authorizations issued by the Ministry of Health or relevant regulatory authority of the destination jurisdiction.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wide border-b border-brand-gray-200 pb-2 mb-3">
              3. International Trade Terms (Incoterms 2020) & Delivery
            </h2>
            <p className="mb-2">
              3.1 Deliveries and commercial quotes are structured pursuant to <strong>Incoterms 2020</strong> published by the International Chamber of Commerce (ICC), typically under FOB (Free on Board, Nhava Sheva / Mumbai Air Cargo), CIF (Cost, Insurance & Freight), CFR (Cost and Freight), or EXW (Ex Works).
            </p>
            <p className="mb-2">
              3.2 For FOB consignments, risk of loss or damage transfers to the buyer once goods pass the ship’s rail or air cargo loading threshold at Indian customs terminals. For CIF consignments, 4Core Exim secures marine cargo transit insurance covering 110% of invoice value under Institute Cargo Clauses (A).
            </p>
            <p>
              3.3 Stated dispatch timelines and vessel ETDs are estimates subject to carrier schedules, freight availability, and customs appraisal.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wide border-b border-brand-gray-200 pb-2 mb-3">
              4. Cold-Chain Logistics & Thermal Integrity
            </h2>
            <p className="mb-2">
              4.1 Temperature-sensitive formulations (such as biologicals, vaccines, and injectables requiring 2°C to 8°C or &lt;25°C controlled room storage) are packed in qualified thermal shippers with calibrated USB/NFC dataloggers and phase-change materials (PCM).
            </p>
            <p>
              4.2 The importer is required to inspect temperature logs immediately upon customs release at the destination airport/port. Any temperature deviation must be recorded on the delivery airway bill and reported to 4Core Exim within 48 hours of physical receipt.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wide border-b border-brand-gray-200 pb-2 mb-3">
              5. Destination Customs, Clearance & Duties
            </h2>
            <p className="mb-2">
              5.1 4Core Exim is responsible for Indian export customs clearance, export inspection, Certificate of Origin (COO) issuance, and legalization of shipping invoices.
            </p>
            <p>
              5.2 The importer assumes complete responsibility for obtaining destination import permits, paying local import duties/tariffs, handling health authority inspections, and obtaining prompt customs clearance.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wide border-b border-brand-gray-200 pb-2 mb-3">
              6. Payment Terms, Letters of Credit & Currencies
            </h2>
            <p className="mb-2">
              6.1 Standard export settlement is conducted in US Dollars (USD), Euros (EUR), or Indian Rupees (INR) via Wire Transfer (Telegraphic Transfer / TT) or Irrevocable, Confirmed Letter of Credit (L/C) at sight issued by an international prime bank.
            </p>
            <p>
              6.2 Advance deposits required for custom packaging or special batch synthesis are non-refundable once batch manufacturing or formulation packaging is initiated.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wide border-b border-brand-gray-200 pb-2 mb-3">
              7. Governing Law & Dispute Resolution
            </h2>
            <p className="mb-2">
              7.1 These commercial terms and all related purchase orders shall be governed by and construed in accordance with the laws of the Republic of India.
            </p>
            <p>
              7.2 Any dispute, controversy, or claim arising out of or in connection with these contracts shall be subject to the exclusive jurisdiction of the competent courts in Nagpur and Mumbai, Maharashtra, India.
            </p>
          </section>

          {/* Legal Disclaimers Box */}
          <div className="bg-brand-gray-50 border border-brand-gray-200 rounded-md p-4 flex items-start gap-3">
            <FiAlertCircle className="text-brand-green-600 text-base shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-brand-gray-900 mb-1">Corporate Contact for Legal Notices</h5>
              <p className="text-brand-gray-600">
                Formal commercial inquiries, contract notices, and compliance queries should be addressed to the Trade Legal Desk via email at <a href="mailto:exports@4coreexim.com" className="text-brand-green-600 font-semibold hover:underline">exports@4coreexim.com</a> or delivered to our registered corporate address in Nagpur, Maharashtra, India.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
