import { useEffect, useState } from 'react';
import { fetchCustomers } from '../services/customerService';
import { fetchSalesSummary } from '../services/salesService';

const CRMPage = () => {
  const [customers, setCustomers] = useState([]);
  const [salesSummary, setSalesSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [customerData, salesData] = await Promise.all([fetchCustomers(), fetchSalesSummary()]);
        setCustomers(customerData || []);
        setSalesSummary(salesData || {});
      } catch (error) {
        console.error('CRM load failed', error);
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
          <h3 className="page-title">CRM Dashboard</h3>
          <p className="text-muted">Customer records, sales pipeline, and lead activity for your sales team.</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card card-custom p-4">
            <h5>Customer Management</h5>
            <p className="text-muted">Manage customer touchpoints and streamline contact workflows.</p>
            <div className="d-flex flex-column gap-2">
              <span>Active customers: {customers.length}</span>
              <span>New leads this week: {salesSummary.total_orders ?? 0}</span>
              <span>Open opportunities: {salesSummary.topCustomers?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card card-custom p-4">
            <h5>Sales Pipeline</h5>
            <p className="text-muted">Opportunity stages and conversion velocity for current deals.</p>
            <div className="d-flex flex-column gap-2">
              <span>Total revenue: ${salesSummary.total_revenue?.toLocaleString() || 0}</span>
              <span>Orders processed: {salesSummary.total_orders || 0}</span>
              <span>Key accounts: {salesSummary.topCustomers?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card card-custom p-4">
            <h5>Lead Tracking</h5>
            <p className="text-muted">Stay ahead of the funnel with stage-based analytics and follow-up alerts.</p>
            <div className="d-flex flex-column gap-2">
              <span>Top customer: {salesSummary.topCustomers?.[0]?.customer_name || 'N/A'}</span>
              <span>Average deal size: ${salesSummary.average_deal_size?.toLocaleString() || 'N/A'}</span>
              <span>Pipeline value: ${salesSummary.total_revenue?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMPage;
