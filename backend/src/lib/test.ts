import bcrypt from "bcryptjs";
import { prisma } from "../db";

export async function main() {
  console.log("🌱 Seeding database...");

  const organization = await prisma.organization.create({
    data: {
      organizationName: "Lumel",
      organizationCode: "LUMEL123",
      organizationDescription:
        "A modern SaaS company for project collaboration.",
    },
  });

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@lumel.com",
      username: "Ranjith",
      passwordHash: adminPassword,
      role: "ADMIN",
      organizationId: organization.id,
    },
  });

  const hrPassword = await bcrypt.hash("Hr@123", 10);
  const hr1 = await prisma.user.create({
    data: {
      email: "vimal@lumel.com",
      username: "Vimal",
      passwordHash: hrPassword,
      role: "HR",
      organizationId: organization.id,
      managerId: admin.id,
    },
  });

  const managerPassword = await bcrypt.hash("Manager@123", 10);
  const manager1 = await prisma.user.create({
    data: {
      email: "alice@lumel.com",
      username: "Alice",
      passwordHash: managerPassword,
      role: "HR",
      organizationId: organization.id,
      managerId: admin.id,
    },
  });

  const employeePassword = await bcrypt.hash("Employee@123", 10);
  const employees = await prisma.user.createMany({
    data: [
      {
        email: "bob@lumel.com",
        username: "Bob",
        passwordHash: employeePassword,
        role: "EMPLOYEE",
        organizationId: organization.id,
        managerId: hr1.id,
      },
      {
        email: "sarah@lumel.com",
        username: "Sarah",
        passwordHash: employeePassword,
        role: "EMPLOYEE",
        organizationId: organization.id,
        managerId: hr1.id,
      },
      {
        email: "john@lumel.com",
        username: "John",
        passwordHash: employeePassword,
        role: "EMPLOYEE",
        organizationId: organization.id,
        managerId: manager1.id,
      },
      {
        email: "emma@lumel.com",
        username: "Emma",
        passwordHash: employeePassword,
        role: "EMPLOYEE",
        organizationId: organization.id,
        managerId: manager1.id,
      },
      {
        email: "david@lumel.com",
        username: "David",
        passwordHash: employeePassword,
        role: "EMPLOYEE",
        organizationId: organization.id,
        managerId: manager1.id,
      },
    ],
  });

  //   console.log({
  //     organization,
  //     admin,
  //     hr1,
  //     manager1,
  //     employeesCount: employees.count,
  //   });
}
