import { AppRouter } from '../routes';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="bottom-right" />
    </>
  );
}
