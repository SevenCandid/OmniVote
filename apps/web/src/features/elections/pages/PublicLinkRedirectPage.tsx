import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../api/publicApi';
import { BaseLoader } from '@/components/ui/BaseLoader';

export default function PublicLinkRedirectPage() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['election-short-code', shortCode],
    queryFn: () => publicApi.getElectionByShortCode(shortCode!),
    enabled: !!shortCode,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      navigate(`/voting/${data.organization_id}/${data.election_id}`, { replace: true });
    }
  }, [data, navigate]);

  if (isLoading) {
    return <BaseLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#18181B] p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Invalid Link</h1>
          <p className="text-gray-500">
            This voting link does not exist or has expired. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
