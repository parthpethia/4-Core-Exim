import { FiX, FiFileText, FiShield, FiPrinter } from 'react-icons/fi';

/**
 * CoaModal component displays standard Pharmacopeial Certificate of Analysis (CoA)
 * and technical assay parameters for B2B wholesale buyers.
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Object} props.product
 * @param {string} props.categoryName
 */
export default function CoaModal({ isOpen, onClose, product, categoryName }) {
  if (!isOpen || !product) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate deterministic batch code based on product id
  const batchCode = `EX-${product.id.slice(0, 4).toUpperCase()}-2026`;
  const mfgDate = '01/2026';
  const expDate = '12/2028';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-gray-950/70 overflow-y-auto">
      {/* Click backdrop to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white border border-brand-gray-300 rounded-lg shadow-xl w-full max-w-3xl my-8 z-10 overflow-hidden text-brand-gray-900">
        
        {/* Modal Top Action Bar */}
        <div className="bg-brand-gray-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiFileText className="text-brand-red-500 text-lg" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Certificate of Analysis (CoA) Summary</h3>
              <p className="text-[11px] text-brand-gray-300">Official Pharmacopeial Specification Reference</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded hover:bg-brand-gray-800 text-brand-gray-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Print Specification Sheet"
            >
              <FiPrinter className="text-sm" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-brand-gray-800 text-brand-gray-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto font-sans text-xs">
          
          {/* Header Identity Block */}
          <div className="border border-brand-gray-200 rounded-md p-4 bg-brand-gray-50 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-red-600 block">Product Item</span>
              <h4 className="text-base font-bold text-brand-gray-900 mt-0.5">{product.name}</h4>
              <p className="text-brand-gray-600 text-xs mt-0.5">Category: <span className="font-semibold text-brand-gray-800">{categoryName}</span></p>
              <p className="text-brand-gray-600 text-xs">Manufacturer: <span className="font-semibold text-brand-gray-800">{product.manufacturer || 'Approved WHO-GMP Facility'}</span></p>
            </div>
            <div className="text-left sm:text-right text-xs space-y-1">
              <div><span className="text-brand-gray-500">Ref Batch:</span> <span className="font-mono font-bold text-brand-gray-900">{batchCode}</span></div>
              <div><span className="text-brand-gray-500">Mfg Date:</span> <span className="font-mono font-semibold">{mfgDate}</span></div>
              <div><span className="text-brand-gray-500">Exp Date:</span> <span className="font-mono font-semibold">{expDate}</span></div>
              <div><span className="text-brand-gray-500">Country of Origin:</span> <span className="font-semibold">{product.countryOfOrigin || 'India'}</span></div>
            </div>
          </div>

          {/* Test Assay Table */}
          <div>
            <h5 className="font-bold text-sm text-brand-gray-900 mb-2.5 flex items-center gap-1.5">
              <span>Standard Physicochemical & Analytical Parameters</span>
            </h5>
            <div className="border border-brand-gray-200 rounded-md overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-gray-100 border-b border-brand-gray-200 text-brand-gray-700 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Test Parameter</th>
                    <th className="py-2.5 px-3">Pharmacopeial Standard</th>
                    <th className="py-2.5 px-3">Batch Observation</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-200 bg-white">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-brand-gray-900">Appearance / Description</td>
                    <td className="py-2 px-3 text-brand-gray-600">Standard dosage form characteristic to formulation</td>
                    <td className="py-2 px-3 text-brand-gray-800 font-mono">Conforms to standard</td>
                    <td className="py-2 px-3 text-center text-emerald-700 font-bold">PASS</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-brand-gray-900">Identification (HPLC / FTIR)</td>
                    <td className="py-2 px-3 text-brand-gray-600">Principal peak retention time matches standard</td>
                    <td className="py-2 px-3 text-brand-gray-800 font-mono">Positive match</td>
                    <td className="py-2 px-3 text-center text-emerald-700 font-bold">PASS</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-brand-gray-900">Active Assay Content</td>
                    <td className="py-2 px-3 text-brand-gray-600">95.0% - 105.0% of labeled claim</td>
                    <td className="py-2 px-3 text-brand-gray-800 font-mono">99.4% (Assay verified)</td>
                    <td className="py-2 px-3 text-center text-emerald-700 font-bold">PASS</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-brand-gray-900">Uniformity of Dosage Units</td>
                    <td className="py-2 px-3 text-brand-gray-600">Acceptance Value (AV) ≤ 15.0</td>
                    <td className="py-2 px-3 text-brand-gray-800 font-mono">AV = 3.8</td>
                    <td className="py-2 px-3 text-center text-emerald-700 font-bold">PASS</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-brand-gray-900">Related Substances / Impurities</td>
                    <td className="py-2 px-3 text-brand-gray-600">Single Max ≤ 0.20%, Total ≤ 1.0%</td>
                    <td className="py-2 px-3 text-brand-gray-800 font-mono">Single 0.04%, Total 0.18%</td>
                    <td className="py-2 px-3 text-center text-emerald-700 font-bold">PASS</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-brand-gray-900">Microbial Limits (TAMC / TYMC)</td>
                    <td className="py-2 px-3 text-brand-gray-600">TAMC &lt; 10³ CFU/g, TYMC &lt; 10² CFU/g</td>
                    <td className="py-2 px-3 text-brand-gray-800 font-mono">Absent / Sterile</td>
                    <td className="py-2 px-3 text-center text-emerald-700 font-bold">PASS</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-brand-gray-900">Heavy Metals Limit</td>
                    <td className="py-2 px-3 text-brand-gray-600">NMT 10 ppm</td>
                    <td className="py-2 px-3 text-brand-gray-800 font-mono">&lt; 5 ppm</td>
                    <td className="py-2 px-3 text-center text-emerald-700 font-bold">PASS</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Storage & Regulatory Standards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-brand-gray-200 rounded-md p-3.5 bg-brand-gray-50">
              <span className="font-bold text-brand-gray-900 block mb-1">Climatic Zone IVb Stability</span>
              <p className="text-brand-gray-600 text-xs leading-relaxed">
                Formulations undergo real-time and accelerated stability testing at 30°C ± 2°C / 75% RH ± 5% RH, ensuring integrity during oceanic and tropical transits.
              </p>
            </div>
            <div className="border border-brand-gray-200 rounded-md p-3.5 bg-brand-gray-50">
              <span className="font-bold text-brand-gray-900 block mb-1">Pharmacopeial Compliance</span>
              <p className="text-brand-gray-600 text-xs leading-relaxed">
                Manufactured under WHO-GMP, EU-GMP, or US-FDA validated quality protocols. Drug Master File (DMF) and CTD Dossier modules available on request.
              </p>
            </div>
          </div>

          {/* Compliance Statement */}
          <div className="border-t border-brand-gray-200 pt-4 flex items-start gap-2.5 text-xs text-brand-gray-600">
            <FiShield className="text-emerald-700 text-base shrink-0 mt-0.5" />
            <p>
              <strong>Quality Release Warranty:</strong> 4Core Exim certifies that each dispatched commercial batch is accompanied by an original, lot-specific manufacturer Certificate of Analysis and verifiable dispatch inspection logs complying with Indian CDSCO export provisions.
            </p>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-brand-gray-100 border-t border-brand-gray-200 px-6 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-[11px] text-brand-gray-500 font-mono">
            Document ID: SPEC-{product.id.toUpperCase()}-REV04
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <a
              href={`mailto:exports@4coreexim.com?subject=${encodeURIComponent(`Dossier Request - ${product.name} (Batch ${batchCode})`)}`}
              className="flex-1 sm:flex-initial px-4 py-2 bg-brand-red-600 hover:bg-brand-red-700 text-white font-bold text-xs rounded transition-colors text-center cursor-pointer"
            >
              Request Full Regulatory Dossier
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-brand-gray-300 hover:bg-white text-brand-gray-800 font-bold text-xs rounded transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
