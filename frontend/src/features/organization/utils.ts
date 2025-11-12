export const getRoleColor = (role: string) => {
  const colors = {
    ADMIN:
      "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive",
    HR: "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary",
    MANAGER:
      "bg-accent text-accent-foreground border-accent dark:bg-accent dark:text-accent-foreground",
    EMPLOYEE:
      "bg-muted text-muted-foreground border-border dark:bg-muted dark:text-muted-foreground",
  };
  return (
    colors[role as keyof typeof colors] ||
    "bg-secondary text-secondary-foreground border-border"
  );
};

// Permission checks
export const canManageMembers = (userRole?: string) => {
  return ["ADMIN", "HR"].includes(userRole || "");
};
