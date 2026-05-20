import { useEffect, useState } from 'react';
import { fetchReportSummary } from '../services/reportService';

const ReportsPage = () => {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const response = await fetchReportSummary();
        setSummary(response);
      } catch (error) {
        console.error('Reports load failed', error);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="page-title">Reports</h3>
          <p className="text-muted">Data-driven dashboards and export-ready business analytics.</p>
        </div>
        <button className="btn btn-outline-primary">Export Report</button>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card card-custom p-4">
            <h5>System Summary</h5>
            {loading ? (
              <p className="text-muted">Loading report metrics...</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                <span>Total Users: {summary.total_users ?? 0}</span>
                <span>Total Employees: {summary.total_employees ?? 0}</span>
                <span>Total Customers: {summary.total_customers ?? 0}</span>
                <span>Total Materials: {summary.total_materials ?? 0}</span>
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card card-custom p-4">
            <h5>Inventory & Vendor Alerts</h5>
            {loading ? (
              <p className="text-muted">Loading inventory analytics...</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                <span>Low stock items: {(summary.topMaterials || []).length}</span>
                <span>Top inventory item: {summary.topMaterials?.[0]?.material_name || 'N/A'}</span>
                <span>Vendor interactions: data connected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row gy-4 mt-4">
        <div className="col-lg-4">
          <div className="card card-custom p-4">
            <h6>Total Revenue</h6>
            <p className="h3 mb-0">${summary.total_revenue?.toLocaleString() || '0'}</p>
            <small className="text-muted">Live performance tracking from sales data.</small>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card card-custom p-4">
            <h6>Customer Retention</h6>
            <p className="h3 mb-0">{summary.retention_rate ? `${summary.retention_rate}%` : 'N/A'}</p>
            <small className="text-muted">Strength of repeat engagements.</small>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card card-custom p-4">
            <h6>Supplier Quality</h6>
            <p className="h3 mb-0">{summary.supplier_score ? `${summary.supplier_score}%` : 'N/A'}</p>
            <small className="text-muted">Average supplier score from procurement records.</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
