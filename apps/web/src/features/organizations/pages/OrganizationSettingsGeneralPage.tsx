import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  useOrganization,
  useUpdateOrganization,
  useUpdateOrganizationSettings,
} from '../hooks/useOrganizations';
import { useMyPermissions } from '../../rbac/hooks/useRbac';
import { BaseLoader } from '../../../components/ui/BaseLoader';

export const OrganizationSettingsGeneralPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: org, isLoading } = useOrganization(id!);
  const { hasPermission, isLoading: isLoadingPermissions } =
    useMyPermissions(id);

  const updateOrgMutation = useUpdateOrganization();
  const updateSettingsMutation = useUpdateOrganizationSettings();

  const [formData, setFormData] = useState({
    timezone: 'Africa/Accra',
    date_format: 'YYYY-MM-DD',
    time_format: '24h',
    currency: 'GHS',
  });

  useEffect(() => {
    if (org) {
      setFormData({
        timezone:
          org.settings?.default_timezone || org.timezone || 'Africa/Accra',
        date_format: org.settings?.date_format || 'YYYY-MM-DD',
        time_format: org.settings?.time_format || '24h',
        currency: org.currency || 'GHS',
      });
    }
  }, [org]);

  if (isLoading || isLoadingPermissions) {
    return <BaseLoader />;
  }

  const canEdit = hasPermission('organization.update');

  if (!canEdit) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
        You do not have permission to view or edit organization settings.
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // Currency is on the Organization core model
    updateOrgMutation.mutate({
      id,
      data: {
        currency: formData.currency,
        timezone: formData.timezone, // update both places to be safe
      },
    });

    // Timezone, Date, Time format are on OrganizationSettings
    updateSettingsMutation.mutate({
      id,
      data: {
        default_timezone: formData.timezone,
        date_format: formData.date_format,
        time_format: formData.time_format,
      },
    });
  };

  const isPending =
    updateOrgMutation.isPending || updateSettingsMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          General Settings
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage localization and default preferences for your organization.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {updateOrgMutation.isError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
            <p className="font-semibold">
              Failed to update organization profile
            </p>
            <p>
              {updateOrgMutation.error instanceof Error
                ? updateOrgMutation.error.message
                : 'Unknown error occurred'}
            </p>
          </div>
        )}

        {updateSettingsMutation.isError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
            <p className="font-semibold">
              Failed to update organization settings
            </p>
            <p>
              {updateSettingsMutation.error instanceof Error
                ? updateSettingsMutation.error.message
                : 'Unknown error occurred'}
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-[#18181B] shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Zone
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm rounded-md"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New York</option>
                  <option value="America/Los_Angeles">
                    America/Los Angeles
                  </option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="Africa/Accra">Africa/Accra</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Default Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm rounded-md"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="GHS">GHS (₵)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date Format
                </label>
                <select
                  name="date_format"
                  value={formData.date_format}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm rounded-md"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Format
                </label>
                <select
                  name="time_format"
                  value={formData.time_format}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm rounded-md"
                >
                  <option value="24h">24-hour (14:30)</option>
                  <option value="12h">12-hour (02:30 PM)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Future Configuration Hooks
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
                These sections will be enabled as features are launched.
              </p>

              <div className="space-y-3 opacity-50 pointer-events-none">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Election Defaults
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Configure default voting rules and privacy modes.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md">
                    Coming Soon
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Notification Preferences
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Organization-wide email and digest settings.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#1f1f23] px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Changes apply to all members.
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
