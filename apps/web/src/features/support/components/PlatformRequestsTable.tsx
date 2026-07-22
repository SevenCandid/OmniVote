import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { BaseButton } from '../../../components/ui/BaseButton';
import { SupportRequest } from '../schemas/supportSchema';
import {
  useAcceptSupportRequest,
  useRejectSupportRequest,
} from '../api/supportApi';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

interface PlatformRequestsTableProps {
  requests: SupportRequest[];
  isLoading: boolean;
  error: Error | null;
}

export function PlatformRequestsTable({
  requests,
  isLoading,
  error,
}: PlatformRequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(
    null
  );
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(
    null
  );

  const { mutateAsync: acceptRequest, isPending: isAccepting } =
    useAcceptSupportRequest();
  const { mutateAsync: rejectRequest, isPending: isRejecting } =
    useRejectSupportRequest();

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      if (actionType === 'accept') {
        await acceptRequest({
          requestId: selectedRequest.id,
          durationMinutes: 60,
        });
        toast.success('Support request accepted. Session created.');
      } else {
        await rejectRequest(selectedRequest.id);
        toast.success('Support request rejected.');
      }
      setSelectedRequest(null);
      setActionType(null);
    } catch (err: any) {
      toast.error(err.message || `Failed to ${actionType} request`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading requests...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load support requests.
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Support Requests
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          There are currently no support requests across the platform.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
            <th className="p-4 font-medium">Organization ID</th>
            <th className="p-4 font-medium">Type</th>
            <th className="p-4 font-medium">Description</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium">Created At</th>
            <th className="p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {requests.map((req) => (
            <tr
              key={req.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="p-4 text-sm font-medium text-gray-900 dark:text-white font-mono text-xs">
                {req.organization_id.split('-')[0]}...
              </td>
              <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">
                {req.request_type}
              </td>
              <td className="p-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                {req.description}
              </td>
              <td className="p-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${
                      req.status === 'ACCEPTED' || req.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : req.status === 'REJECTED' ||
                            req.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : req.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}
                >
                  {req.status.toLowerCase()}
                </span>
              </td>
              <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                {new Date(req.created_at).toLocaleString()}
              </td>
              <td className="p-4 flex space-x-2">
                {req.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setActionType('accept');
                      }}
                      className="text-sm font-medium text-green-600 hover:underline"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setActionType('reject');
                      }}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Reject
                    </button>
                  </>
                )}
                {req.status !== 'PENDING' && (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog
        isOpen={!!selectedRequest && !!actionType}
        onClose={() => {
          setSelectedRequest(null);
          setActionType(null);
        }}
        onConfirm={handleAction}
        title={
          actionType === 'accept'
            ? 'Accept Support Request'
            : 'Reject Support Request'
        }
        description={
          actionType === 'accept'
            ? 'Are you sure you want to accept this request? An active support session will be created immediately.'
            : 'Are you sure you want to reject this request? The organization will be notified.'
        }
        confirmText={actionType === 'accept' ? 'Accept' : 'Reject'}
        variant={actionType === 'accept' ? 'primary' : 'danger'}
        isConfirming={isAccepting || isRejecting}
      />
    </div>
  );
}
