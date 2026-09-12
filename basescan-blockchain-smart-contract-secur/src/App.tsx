import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ReportsView } from './components/ReportsView';
import { SimulatorView } from './components/SimulatorView';
import { ComplianceView } from './components/ComplianceView';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedReportId, setSelectedReportId] = useState<string>('rep-001');

  const handleSelectReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setActiveTab('reports');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onSelectReport={handleSelectReport} />;
      case 'reports':
        return <ReportsView selectedReportId={selectedReportId} />;
      case 'simulator':
        return <SimulatorView />;
      case 'compliance':
        return <ComplianceView />;
      default:
        return <DashboardView onSelectReport={handleSelectReport} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main View Area */}
      <main className="main-content">
        <Header activeTab={activeTab} />
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
