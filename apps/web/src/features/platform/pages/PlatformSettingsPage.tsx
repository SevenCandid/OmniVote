import React, { useEffect, useState } from 'react';
import { BaseCard as Card } from '../../../components/ui/BaseCard';
import { BaseButton as Button } from '../../../components/ui/BaseButton';
import { BaseInput as Input } from '../../../components/ui/BaseInput';
import { toast } from 'react-hot-toast';
import {
  platformSettingsApi,
  PlatformSettingsResponse,
  PlatformSettingsUpdate,
} from '../api/platformSettingsApi';
import {
  Loader2,
  Shield,
  Settings,
  Mail,
  Lock,
  AlertTriangle,
  Database,
} from 'lucide-react';

const TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'providers', label: 'Providers', icon: Mail },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

export function PlatformSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<PlatformSettingsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [platformName, setPlatformName] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(true);

  // Secrets states (write-only)
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');

  const fetchSettings = async () => {
    try {
      const data = await platformSettingsApi.getSettings();
      setSettings(data);
      setPlatformName(data.platform_name || '');
      setMaintenanceMode(data.maintenance_mode || false);
      setAllowPublicRegistration(data.allow_public_registration || false);
    } catch (error) {
      toast.error('Failed to load platform settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      const updateData: PlatformSettingsUpdate = {
        platform_name: platformName,
        maintenance_mode: maintenanceMode,
        allow_public_registration: allowPublicRegistration,
      };
      const updated = await platformSettingsApi.updateSettings(updateData);
      setSettings(updated);
      toast.success('General settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProviders = async () => {
    setSaving(true);
    try {
      const updateData: PlatformSettingsUpdate = {};

      // Only send if user typed something
      if (smtpHost || smtpPort || smtpUser || smtpPassword) {
        updateData.smtp_credentials = {
          host: smtpHost,
          port: smtpPort,
          user: smtpUser,
          password: smtpPassword,
        };
      }

      const updated = await platformSettingsApi.updateSettings(updateData);
      setSettings(updated);
      toast.success('Provider settings securely updated');

      // Clear write-only fields
      setSmtpHost('');
      setSmtpPort('');
      setSmtpUser('');
      setSmtpPassword('');
    } catch (error) {
      toast.error('Failed to update provider credentials');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage global configurations, secrets, and operational modes for the
          OmniVote platform.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${activeTab === tab.id ? 'text-primary-700' : 'text-gray-400'}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                General Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Platform Name
                  </label>
                  <Input
                    className="mt-1 max-w-md"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Displayed in system-wide communications.
                  </p>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Allow Public Registration
                    </h3>
                    <p className="text-sm text-gray-500">
                      Allow new users to sign up without an invitation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAllowPublicRegistration(!allowPublicRegistration)
                    }
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      allowPublicRegistration ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        allowPublicRegistration
                          ? 'translate-x-5'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-red-600">
                      Maintenance Mode
                    </h3>
                    <p className="text-sm text-gray-500">
                      Prevent non-admin access while updating the system.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                      maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button onClick={handleSaveGeneral} isLoading={saving}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'providers' && (
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Email & SMS Providers
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Sensitive configuration values are encrypted at rest via the
                Platform Secret Management service. Existing values are never
                displayed. Entering new values will securely overwrite the old
                ones.
              </p>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-medium text-gray-900 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      SMTP Credentials
                    </h3>
                    {settings?.smtp_credentials_configured ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        Not Configured
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Host
                      </label>
                      <Input
                        className="mt-1"
                        placeholder="e.g. smtp.mailgun.org"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Port
                      </label>
                      <Input
                        className="mt-1"
                        placeholder="e.g. 587"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Username
                      </label>
                      <Input
                        className="mt-1"
                        placeholder="SMTP User"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Password / API Key
                      </label>
                      <Input
                        type="password"
                        className="mt-1"
                        placeholder="••••••••"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button onClick={handleSaveProviders} isLoading={saving}>
                    Securely Update Providers
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Security Configuration
              </h2>
              <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500">
                  Security configurations coming soon.
                </p>
              </div>
            </Card>
          )}

          {activeTab === 'danger' && (
            <Card className="p-6 border-red-200">
              <h2 className="text-lg font-medium text-red-600 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                These actions are destructive or impact all organizations on the
                platform.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-t border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Clear Platform Cache
                    </h3>
                    <p className="text-sm text-gray-500">
                      Purge Redis cache for all organizations.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Clear Cache
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
