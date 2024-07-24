import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';
import "react-toastify/dist/ReactToastify.css";
import LoginPage from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <>
     <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/homepage" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
    </>
  );
}

export default App;
