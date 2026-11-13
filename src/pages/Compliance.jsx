import { FiCheckCircle, FiShield } from 'react-icons/fi';
import PageSEO from '../components/PageSEO';

export default function Compliance() {
  const compliancePillars = [
    {
      title: "WHO-GMP & US-FDA Sourcing",
      standard: "WHO-TRS 986 / cGMP 21 CFR Part 211",
      desc: "Batches are procured directly from validated Indian pharmaceutical manufacturing facilities holding active WHO-GMP, EU-GMP, or US-FDA inspection certificates.",
      checks: [
        "Annual regulatory audit verification",
        "Clean room HVAC classification (Class A/B/C/D)",
        "Validated water-for-injection (WFI) generation systems",
        "Batch-to-batch API assay consistency"
      ]
    },
    {
      title: "Cold-Chain Thermal Validation",
      standard: "WHO Technical Report Series No. 961 Annex 9",
      desc: "End-to-end refrigerated transit pipelines ensuring thermal integrity for biologicals, injectables, and vaccines during international air and ocean transit.",
      checks: [
        "Pre-qualified phase-change material (PCM) shippers",
        "Calibrated USB & NFC real-time temperature loggers",
        "Dual-zone monitoring (2°C - 8°C biologicals / 15°C - 25°C controlled)",
        "Automated deviation alerts on arrival"
      ]
    },
    {
      title: "Regulatory Dossier & DMF Modules",
      standard: "ICH Common Technical Document (CTD / eCTD)",
      desc: "Comprehensive technical dossiers tailored for Ministry of Health registrations, product licensing, and custom clearance in importing jurisdictions.",
      checks: [
        "Module 1: Administrative & Prescribing Information",
        "Module 2: Quality & Clinical Overviews / Summaries",
        "Module 3: Chemical, Pharmaceutical & Biological Documentation (CMC)",
        "Drug Master File (DMF) Access Letters & CoPP"
      ]
    },
    {
      title: "Pharmacopeial Monographs & QC",
      standard: "IP / BP / USP / EP Monographs",
      desc: "All formulation batches comply with official compendial monographs, tested in GLP-certified analytical laboratories prior to export dispatch.",
      checks: [
        "Active Ingredient Assay via validated HPLC/FTIR",
        "Related substances and impurity quantification (<0.15%)",
        "Microbial enumeration (TAMC / TYMC / Pathogen screening)",
        "Dissolution profile and stability in Climatic Zone IVb"
      ]
    }
  ];

  return (
    <div className="bg-brand-gray-50 min-h-screen py-12">
      <PageSEO
        title="WHO-GMP Export Compliance — Pharmaceutical Quality Standards"
        description="4Core Exim quality management system: WHO-GMP, EU-GMP, US-FDA compliance. Certificate of Analysis (CoA), CoPP, CTD dossier support for pharmaceutical imports from India."
        path="/compliance"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="bg-white border border-brand-gray-200 rounded-lg p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-2 text-brand-red-600 font-bold text-xs uppercase tracking-wider mb-2">
            <FiShield />
            <span>Quality Assurance & Regulatory Governance</span>
          </div>
          <h1 className="text-3xl font-bold text-brand-gray-900 tracking-tight">Pharmaceutical Export Compliance Standards</h1>
          <p className="text-xs text-brand-gray-500 mt-2 font-mono">
            Standard Operating Procedure: 4CE-QA-REG-2026
          </p>
          <p className="text-xs text-brand-gray-700 mt-4 leading-relaxed font-medium">
            4Core Exim operates under a strict Quality Management System (QMS) ensuring that every pharmaceutical consignment dispatched from Mumbai/Nagpur complies with Indian CDSCO export provisions and international health authority standards.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {compliancePillars.map((pillar, idx) => (
            <div key={idx} className="bg-white border border-brand-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-base font-bold text-brand-gray-900">{pillar.title}</h3>
                  <span className="text-[10px] font-mono font-bold bg-brand-gray-100 border border-brand-gray-200 text-brand-gray-700 px-2 py-0.5 rounded">
                    {pillar.standard}
                  </span>
                </div>
                <p className="text-xs text-brand-gray-600 leading-relaxed mb-4">
                  {pillar.desc}
                </p>
                <div className="space-y-2 border-t border-brand-gray-150 pt-3">
                  <span className="text-[10px] uppercase font-bold text-brand-gray-500 tracking-wider block">Verification Protocol:</span>
                  {pillar.checks.map((check, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2 text-xs text-brand-gray-800">
                      <FiCheckCircle className="text-emerald-600 shrink-0 text-sm" />
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Export Documentation Matrix */}
        <div className="bg-white border border-brand-gray-200 rounded-lg p-8 shadow-sm mb-8">
          <h2 className="text-base font-bold text-brand-gray-900 uppercase tracking-wide border-b border-brand-gray-200 pb-3 mb-5">
            Standard Export Documentation Package
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 border border-brand-gray-200 rounded bg-brand-gray-50">
              <span className="font-bold text-brand-gray-900 block mb-1">Certificate of Analysis (CoA)</span>
              <p className="text-brand-gray-600">Batch-specific chemical assay, dissolution, and microbiological test release certificate.</p>
            </div>
            <div className="p-3.5 border border-brand-gray-200 rounded bg-brand-gray-50">
              <span className="font-bold text-brand-gray-900 block mb-1">Certificate of Pharmaceutical Product (CoPP)</span>
              <p className="text-brand-gray-600">WHO-format certification issued by Indian State FDA / CDSCO authorities.</p>
            </div>
            <div className="p-3.5 border border-brand-gray-200 rounded bg-brand-gray-50">
              <span className="font-bold text-brand-gray-900 block mb-1">Certificate of Origin (COO)</span>
              <p className="text-brand-gray-600">Chamber of Commerce legalized documentation for preferential tariff clearance.</p>
            </div>
            <div className="p-3.5 border border-brand-gray-200 rounded bg-brand-gray-50">
              <span className="font-bold text-brand-gray-900 block mb-1">Material Safety Data Sheet (MSDS)</span>
              <p className="text-brand-gray-600">16-section standard hazard identification and emergency freight handling guide.</p>
            </div>
            <div className="p-3.5 border border-brand-gray-200 rounded bg-brand-gray-50">
              <span className="font-bold text-brand-gray-900 block mb-1">Stability Study Data (Zone IVb)</span>
              <p className="text-brand-gray-600">Accelerated and real-time stability verification for tropical and oceanic zones.</p>
            </div>
            <div className="p-3.5 border border-brand-gray-200 rounded bg-brand-gray-50">
              <span className="font-bold text-brand-gray-900 block mb-1">Customs Commercial Manifest</span>
              <p className="text-brand-gray-600">Standard Commercial Invoice, Detailed Packing List, Airway Bill / Ocean Bill of Lading.</p>
            </div>
          </div>
        </div>

        {/* Regulatory Inquiry CTA */}
        <div className="bg-brand-gray-900 text-white rounded-lg p-8 border border-brand-gray-800 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-[10px] font-bold text-brand-red-500 uppercase tracking-widest block mb-1">Regulatory Inquiries</span>
            <h3 className="text-lg font-bold">Require Dossier Files for Product Registration?</h3>
            <p className="text-xs text-brand-gray-300 mt-1 max-w-xl">
              Our regulatory affairs desk coordinates CTD dossiers, GMP inspection certificates, and sample packs for ministry registration dossiers globally.
            </p>
          </div>
          <a
            href="mailto:exports@4coreexim.com?subject=Regulatory%20Dossier%20%26%20Compliance%20Inquiry"
            className="px-6 py-3 bg-brand-red-600 hover:bg-brand-red-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors shrink-0 text-center cursor-pointer"
          >
            Contact Regulatory Desk
          </a>
        </div>

      </div>
    </div>
  );
}
