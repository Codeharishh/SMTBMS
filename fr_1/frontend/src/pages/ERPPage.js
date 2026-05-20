import { useEffect, useState } from 'react';
import { fetchProcurements } from '../services/procurementService';
import { fetchVendors } from '../services/vendorService';

const ERPPage = () => {
  const [procurements, setProcurements] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [procurementData, vendorData] = await Promise.all([fetchProcurements(), fetchVendors()]);
        setProcurements(procurementData || []);
        setVendors(vendorData || []);
      } catch (error) {
        console.error('ERP load failed', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="page-title">ERP Management</h3>
          <p className="text-muted">Procurement, vendor tracking, order lifecycle and financial summaries in one view.</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card card-custom p-4">
            <h5>Procurement</h5>
            <p className="text-muted">Purchase orders, supplier status and inventory replenishment.</p>
            {loading ? (
              <p className="text-muted">Loading procurement data...</p>
            ) : (
              <div className="d-flex gap-2 flex-column">
                <span>Open procurements: {procurements.length}</span>
                <span>Recent order: {procurements[0]?.procurement_code || 'N/A'}</span>
                <span>Pending approvals: {procurements.filter((item) => item.status === 'Pending').length}</span>
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card card-custom p-4">
            <h5>Vendor Management</h5>
            <p className="text-muted">Stable vendor network and contract performance tracking.</p>
            {loading ? (
              <p className="text-muted">Loading vendor data...</p>
            ) : (
              <div className="d-flex gap-2 flex-column">
                <span>Approved vendors: {vendors.length}</span>
                <span>Top vendor: {vendors[0]?.vendor_name || 'N/A'}</span>
                <span>Vendor score: {vendors[0]?.rating || 'N/A'}</span>
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card card-custom p-4">
            <h5>Financial Summary</h5>
            <p className="text-muted">Working capital, procurement spend and outstanding commitments.</p>
            <div className="d-flex gap-2 flex-column">
              <span>Spend this month: $128,400</span>
              <span>Available budget: $82,300</span>
              <span>Projected savings: $17,800</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ERPPage;
