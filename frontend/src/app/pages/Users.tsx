import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { internshipService, userService } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import type { Internship, User } from "../types";

interface UserFormState {
  name: string;
  email: string;
  password: string;
  role: "mentor" | "student";
  mentor_id: string;
  internship_id: string;
  github_username: string;
}

const emptyCreateForm: UserFormState = {
  name: "",
  email: "",
  password: "",
  role: "student",
  mentor_id: "",
  internship_id: "",
  github_username: "",
};

export function UsersPage() {
  const { callApi, loading } = useApi();
  const [users, setUsers] = useState<User[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [createForm, setCreateForm] = useState<UserFormState>(emptyCreateForm);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UserFormState>(emptyCreateForm);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState("password123");

  const mentors = useMemo(() => users.filter((item) => item.role === "mentor"), [users]);
  const internshipMap = useMemo(() => {
    const map = new Map<string, Internship>();
    internships.forEach((item) => map.set(item.id, item));
    return map;
  }, [internships]);

  async function loadUsers() {
    await callApi(
      async () => {
        const data = await userService.list();
        setUsers(data);
      },
      { errorMessage: "Unable to load users." }
    );
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    void callApi(
      async () => {
        const data = await internshipService.list();
        setInternships(data);
      },
      { errorMessage: "Unable to load internships." }
    );
  }, [callApi]);

  async function handleCreateUser(event: FormEvent) {
    event.preventDefault();
    await callApi(
      async () => {
        await userService.create({
          name: createForm.name,
          email: createForm.email,
          password: createForm.password,
          role: createForm.role,
          mentor_id: createForm.role === "student" ? createForm.mentor_id || null : null,
          internship_id: createForm.internship_id || null,
          github_username: createForm.github_username || null,
        });
        setCreateForm(emptyCreateForm);
        await loadUsers();
      },
      { successMessage: "New user created", errorMessage: "Unable to create user" }
    );
  }

  function startEditUser(user: User) {
    setEditingUserId(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role === "mentor" ? "mentor" : "student",
      mentor_id: user.mentor_id ?? "",
      internship_id: user.internship_id ?? "",
      github_username: user.github_username ?? "",
    });
  }

  async function handleUpdateUser(event: FormEvent) {
    event.preventDefault();
    if (!editingUserId) return;

    await callApi(
      async () => {
        await userService.update(editingUserId, {
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          mentor_id: editForm.role === "student" ? editForm.mentor_id || null : null,
          internship_id: editForm.internship_id || null,
          github_username: editForm.github_username || null,
          ...(editForm.password.trim() ? { password: editForm.password } : {}),
        });
        setEditingUserId(null);
        setEditForm(emptyCreateForm);
        await loadUsers();
      },
      { successMessage: "User updated", errorMessage: "Unable to update user" }
    );
  }

  async function handleDeleteUser() {
    if (!deleteTarget) return;
    await callApi(
      async () => {
        await userService.remove(deleteTarget.id);
        setDeleteTarget(null);
        if (editingUserId === deleteTarget.id) setEditingUserId(null);
        await loadUsers();
      },
      { successMessage: "User deleted", errorMessage: "Unable to delete user" }
    );
  }

  async function handleResetPassword() {
    if (!resetTarget) return;
    await callApi(
      async () => {
        await userService.resetPassword(resetTarget.id, resetPassword);
        setResetTarget(null);
        setResetPassword("password123");
      },
      { successMessage: "Password reset successful", errorMessage: "Unable to reset password" }
    );
  }

  return (
    <div className="space-y-6">
      <Card className="hover:translate-y-0">
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreateUser}>
            <Input
              placeholder="Full name"
              value={createForm.name}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Input
              placeholder="Email"
              type="email"
              value={createForm.email}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <Input
              placeholder="Password"
              type="password"
              value={createForm.password}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            <select
              className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={createForm.role}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, role: event.target.value as "mentor" | "student" }))}
            >
                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
              </select>
              <select
                className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                value={createForm.internship_id}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, internship_id: event.target.value }))}
              >
                <option value="">Assign internship domain</option>
                {internships.map((internship) => (
                  <option key={internship.id} value={internship.id}>
                    {internship.domain} - {internship.title}
                  </option>
                ))}
              </select>
              {createForm.role === "student" ? (
                <select
                  className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                value={createForm.mentor_id}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, mentor_id: event.target.value }))}
              >
                <option value="">Assign mentor</option>
                {mentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.name}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                placeholder="GitHub username"
                value={createForm.github_username}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, github_username: event.target.value }))}
              />
            )}
            <div className="md:col-span-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="hover:translate-y-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Management</CardTitle>
          {loading ? <p className="text-xs text-gray-500">Syncing...</p> : null}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Internship</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-900">
                    <td className="py-3 text-gray-900 dark:text-gray-100">{user.name}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">{user.email}</td>
                    <td className="py-3 capitalize text-gray-600 dark:text-gray-300">{user.role}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">
                      {user.internship_id ? (
                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          {internshipMap.get(user.internship_id)?.domain ?? "Assigned"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="py-3">
                      {user.role !== "admin" ? (
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => startEditUser(user)}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setResetTarget(user)}>
                            Reset Password
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(user)}>
                            Delete
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editingUserId ? (
        <Card className="hover:translate-y-0">
          <CardHeader>
            <CardTitle>Update User</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={handleUpdateUser}>
              <Input
                placeholder="Full name"
                value={editForm.name}
                onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <Input
                placeholder="Email"
                type="email"
                value={editForm.email}
                onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
              />
              <Input
                placeholder="New password (optional)"
                type="password"
                value={editForm.password}
                onChange={(event) => setEditForm((prev) => ({ ...prev, password: event.target.value }))}
              />
              <select
                className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                value={editForm.role}
                onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value as "mentor" | "student" }))}
              >
                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
              </select>
              <select
                className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                value={editForm.internship_id}
                onChange={(event) => setEditForm((prev) => ({ ...prev, internship_id: event.target.value }))}
              >
                <option value="">Assign internship domain</option>
                {internships.map((internship) => (
                  <option key={internship.id} value={internship.id}>
                    {internship.domain} - {internship.title}
                  </option>
                ))}
              </select>
              {editForm.role === "student" ? (
                <select
                  className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                  value={editForm.mentor_id}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, mentor_id: event.target.value }))}
                >
                  <option value="">Assign mentor</option>
                  {mentors.map((mentor) => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  placeholder="GitHub username"
                  value={editForm.github_username}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, github_username: event.target.value }))}
                />
              )}
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update User"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingUserId(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {resetTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-md hover:translate-y-0">
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Set a new password for <span className="font-semibold">{resetTarget.email}</span>
              </p>
              <Input
                type="password"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
                placeholder="New password"
              />
              <div className="flex gap-2">
                <Button onClick={handleResetPassword} disabled={loading || resetPassword.trim().length < 6}>
                  {loading ? "Resetting..." : "Confirm Reset"}
                </Button>
                <Button variant="outline" onClick={() => setResetTarget(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-md hover:translate-y-0">
            <CardHeader>
              <CardTitle>Delete User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete <span className="font-semibold">{deleteTarget.email}</span>? This action
                cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleDeleteUser} disabled={loading}>
                  {loading ? "Deleting..." : "Delete User"}
                </Button>
                <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
