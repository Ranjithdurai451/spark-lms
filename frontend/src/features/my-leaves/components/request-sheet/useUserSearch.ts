import { useState, useMemo } from "react";

export function useUserSearch(orgUsers: any[], currentUserId?: string) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim())
      return orgUsers.filter((u) => u.id !== currentUserId);

    const query = searchQuery.toLowerCase();
    return orgUsers.filter(
      (u) =>
        u.id !== currentUserId &&
        (u.username.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.role.toLowerCase().includes(query))
    );
  }, [orgUsers, searchQuery, currentUserId]);

  return { searchQuery, setSearchQuery, filteredUsers };
}
