const SettingsPage = () => {
  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="page-title">Settings</h3>
          <p className="text-muted">Manage your account preferences, theme and security settings.</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card card-custom p-4">
            <h5>Account Settings</h5>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" placeholder="user@company.com" />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input className="form-control" placeholder="(555) 123-4567" />
            </div>
            <button className="btn btn-primary">Save Settings</button>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card card-custom p-4">
            <h5>Security</h5>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="********" />
            </div>
            <button className="btn btn-outline-primary">Update Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
