"use client";

export default function UsersTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Users
          </h2>

          <p className="text-sm text-gray-500">
            Manage users who have access to this company account.
          </p>
        </div>

        <button className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white">
          + Add User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="px-4 py-4">John Perera</td>
              <td className="px-4 py-4">john@email.com</td>
              <td className="px-4 py-4">Admin</td>
              <td className="px-4 py-4">Active</td>
              <td className="px-4 py-4">
                <button className="text-blue-600">
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}