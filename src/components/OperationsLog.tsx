import React, { useState } from 'react';
import { useHeliosData } from '../context/HeliosDataContext';
import { Terminal } from 'lucide-react';

export const OperationsLog: React.FC = () => {
  const { syncLogs, commands, t } = useHeliosData();
  const [activeTab, setActiveTab] = useState<'ALL' | 'SYNC' | 'COMMANDS'>('ALL');

  return (
    <div className="telemetry-log-card glass-card">
      <div className="log-header">
        <div className="log-title-group">
          <Terminal size={16} className="text-cyan" />
          <h3 className="log-title">{t.reactiveLogTitle}</h3>
          <span className="live-stream-badge font-mono">{t.wsPushActiveBadge}</span>
        </div>

        <div className="log-tabs">
          <button 
            className={`log-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            {t.tabAll}
          </button>
          <button 
            className={`log-tab-btn ${activeTab === 'SYNC' ? 'active' : ''}`}
            onClick={() => setActiveTab('SYNC')}
          >
            {t.tabSyncs} ({syncLogs.length})
          </button>
          <button 
            className={`log-tab-btn ${activeTab === 'COMMANDS' ? 'active' : ''}`}
            onClick={() => setActiveTab('COMMANDS')}
          >
            {t.tabDispatches} ({commands.length})
          </button>
        </div>
      </div>

      <div className="log-stream-window font-mono">
        {syncLogs.length === 0 && commands.length === 0 && (
          <div className="log-empty text-muted">{t.listeningStream}</div>
        )}

        {/* Sync logs */}
        {(activeTab === 'ALL' || activeTab === 'SYNC') && syncLogs.map((log, idx) => (
          <div key={`sync-${idx}`} className={`log-entry entry-${log.status.toLowerCase()}`}>
            <div className="entry-left">
              <span className="entry-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="entry-source-tag">[{log.source}]</span>
              <span className="entry-msg">{log.message}</span>
            </div>
            <div className="entry-right">
              <span className="entry-duration text-cyan">{log.duration_ms}ms</span>
              <span className="entry-checksum text-muted">{log.checksum}</span>
            </div>
          </div>
        ))}

        {/* Command logs */}
        {(activeTab === 'ALL' || activeTab === 'COMMANDS') && commands.map((cmd) => (
          <div key={cmd.command_id} className="log-entry entry-command">
            <div className="entry-left">
              <span className="entry-time">{new Date(cmd.created_at).toLocaleTimeString()}</span>
              <span className="entry-source-tag text-solar">[WRITE_PATH]</span>
              <span className="entry-msg">
                Command {cmd.command_id} ({cmd.command_type}): Target {cmd.depot_id} &bull; Author: {cmd.author}
              </span>
            </div>
            <div className="entry-right">
              <span className="entry-status-badge text-emerald">{cmd.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
