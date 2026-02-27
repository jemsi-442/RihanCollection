import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { FiUserCheck, FiUserX } from "react-icons/fi";
import { extractList, extractOne } from "../../utils/apiShape";
import PageState from "../../components/PageState";
import { useToast } from "../../hooks/useToast";

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/users");
      setUsers(extractList(data, ["users", "items"]));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId, currentRole) => {
    try {
      setUpdatingId(userId);
      const newRole = currentRole === "admin" ? "user" : "admin";
      const { data } = await axios.patch(`/users/${userId}/role`, { role: newRole });
      const updated = extractOne(data);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: updated.role } : u))
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">Manage Users</h2>

      {loading ? (
        <PageState title="Loading users..." />
      ) : error ? (
        <PageState tone="error" title="Users unavailable" description={error} />
      ) : users.length === 0 ? (
        <PageState title="No users found" />
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full min-w-[700px] border-collapse border border-gray-200">
            <thead className="bg-pink-100">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-pink-50 transition">
                  <td className="p-2 border">{u.name}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border capitalize">{u.role}</td>
                  <td className="p-2 border">
                    <button
                      disabled={updatingId === u._id}
                      onClick={() => toggleRole(u._id, u.role)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                      {u.role === "admin" ? <FiUserX /> : <FiUserCheck />}
                      {u.role === "admin" ? "Make User" : "Make Admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
