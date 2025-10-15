import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TransactionsPage from './pages/Transactions';
import UsersPage from './pages/Users';

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand bg-light px-3">
        <Link className="navbar-brand" to="/">FMS</Link>
        <div className="ms-auto">
          <Link className="btn btn-outline-primary me-2" to="/login">Login</Link>
          <Link className="btn btn-primary" to="/register">Register</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<TransactionsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
