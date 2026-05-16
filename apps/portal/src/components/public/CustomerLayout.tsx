import { CustomerAuthProvider } from '../../context/CustomerAuthContext.jsx';
import Navbar from './Navbar';

export default function CustomerLayout({ children }) {
  return (
    <CustomerAuthProvider>
      <Navbar />
      {children}
    </CustomerAuthProvider>
  );
}