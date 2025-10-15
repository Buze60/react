import { useEffect, useState } from 'react';
import api from '../services/api/client';

interface User { _id: string; email: string; name: string; role: 'admin'|'finance_expert'; isActive: boolean }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  async function load() {
    const { data } = await api.get('/users');
    setUsers(data.data);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="container p-4">
      <h3>Users</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Email</th><th>Name</th><th>Role</th><th>Active</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.email}</td><td>{u.name}</td><td>{u.role}</td><td>{String(u.isActive)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
