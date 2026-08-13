import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useVoters, useAddVoter, useBulkAddVoters, useDeleteVoter } from '../hooks/useVoters';
import { Users, Upload, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { BaseLoader } from '../../../components/ui/BaseLoader';

export const ElectionVotersPage: React.FC = () => {
  const { id: organizationId, electionId } = useParams<{ id: string; electionId: string }>();
  const [skip] = useState(0);
  const limit = 50;

  const { data: votersData, isLoading, isError } = useVoters(organizationId!, electionId!, skip, limit);
  const { mutate: addVoter, isPending: isAdding } = useAddVoter(organizationId!, electionId!);
  const { mutate: deleteVoter } = useDeleteVoter(organizationId!, electionId!);
  const { mutate: bulkAddVoters, isPending: isBulkAdding } = useBulkAddVoters(organizationId!, electionId!);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [newVoter, setNewVoter] = useState({
    voter_identifier: '',
    full_name: '',
    email: '',
    phone_number: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [bulkSuccess, setBulkSuccess] = useState<number | null>(null);

  if (isLoading) return <BaseLoader />;
  if (isError) return <div className="p-6 text-red-500">Error loading voters.</div>;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVoter(newVoter, {
      onSuccess: () => {
        setIsAddModalOpen(false);
        setNewVoter({ voter_identifier: '', full_name: '', email: '', phone_number: '' });
      },
      onError: (err: any) => {
        alert(err?.response?.data?.detail || 'Failed to add voter');
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n');
      const voters = [];
      // Assuming format: Identifier,Full Name,Email,Phone
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [identifier, name, email, phone] = line.split(',');
        if (identifier && name) {
          voters.push({
            voter_identifier: identifier.trim(),
            full_name: name.trim(),
            email: email ? email.trim() : null,
            phone_number: phone ? phone.trim() : null,
          });
        }
      }
      
      if (voters.length > 0) {
        bulkAddVoters(voters, {
          onSuccess: (data: any) => {
            setBulkSuccess(data.success_count);
            setBulkErrors(data.errors || []);
            if (fileInputRef.current) fileInputRef.current.value = '';
          },
          onError: (err: any) => {
            alert(err?.response?.data?.detail || 'Failed to import voters');
          }
        });
      } else {
        alert("No valid rows found in CSV. Expected: Identifier,Full Name,Email,Phone");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6" /> Voter Registry
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Manage who is eligible to vote in this election. Total eligible: {votersData?.total || 0}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Voter
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Identifier</th>
                <th className="px-6 py-4 whitespace-nowrap">Name</th>
                <th className="px-6 py-4 whitespace-nowrap hidden md:table-cell">Contact</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {votersData?.items.map((voter) => (
                <tr key={voter.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {voter.voter_identifier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {voter.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    <div className="flex flex-col text-xs">
                      <span>{voter.email || '-'}</span>
                      <span>{voter.phone_number || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {voter.has_voted ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Voted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        <XCircle className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${voter.full_name}?`)) {
                          deleteVoter(voter.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Remove Voter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {votersData?.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No voters found. Add one manually or import via CSV.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls could go here */}

      {/* Add Single Voter Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Voter</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                &times;
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voter Identifier (Unique)</label>
                <input
                  type="text"
                  required
                  value={newVoter.voter_identifier}
                  onChange={(e) => setNewVoter({ ...newVoter, voter_identifier: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="e.g. Student ID, Employee Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newVoter.full_name}
                  onChange={(e) => setNewVoter({ ...newVoter, full_name: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={newVoter.email}
                    onChange={(e) => setNewVoter({ ...newVoter, email: e.target.value })}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={newVoter.phone_number}
                    onChange={(e) => setNewVoter({ ...newVoter, phone_number: e.target.value })}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={isAdding} className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] border border-transparent rounded-lg hover:bg-opacity-90 disabled:opacity-50">
                  {isAdding ? 'Adding...' : 'Add Voter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Import Voters from CSV</h3>
              <button onClick={() => { setIsBulkModalOpen(false); setBulkSuccess(null); setBulkErrors([]); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload a CSV file containing your voter list. The file MUST have a header row and follow this exact column order: <strong>Identifier, Full Name, Email (optional), Phone (optional)</strong>.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center bg-gray-50 dark:bg-gray-800/50">
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  id="csv-upload"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={isBulkAdding}
                />
                <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center justify-center">
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  <span className="text-sm font-medium text-[var(--color-primary)] hover:underline">
                    {isBulkAdding ? 'Processing...' : 'Click to upload a .csv file'}
                  </span>
                </label>
              </div>

              {bulkSuccess !== null && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Successfully imported {bulkSuccess} voters.
                </div>
              )}

              {bulkErrors.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg text-sm max-h-40 overflow-y-auto">
                  <p className="font-semibold mb-2">Import Errors ({bulkErrors.length}):</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {bulkErrors.slice(0, 10).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {bulkErrors.length > 10 && (
                      <li>...and {bulkErrors.length - 10} more.</li>
                    )}
                  </ul>
                </div>
              )}
              
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ElectionVotersPage;
