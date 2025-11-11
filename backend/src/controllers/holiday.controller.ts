import type { Request, Response } from "express";
import { prisma } from "../db";

export const getHolidays = async (req: Request, res: Response) => {
  try {
    // const { type, recurring } = req.query;
    const organizationId = req.user.organization.id;
    const filters: any = { organizationId };
    // if (type) filters.type = type;
    // if (recurring !== undefined)
    //   filters.recurring = recurring === "true" ? true : false;

    const holidays = await prisma.holiday.findMany({
      where: filters,
      orderBy: { date: "asc" },
    });

    res.status(200).json({
      message: "Holidays fetched successfully.",
      data: holidays,
    });
  } catch (error) {
    console.error("❌ getHolidays error:", error);
    res.status(500).json({ message: "Failed to fetch holidays." });
  }
};

export const createHoliday = async (req: Request, res: Response) => {
  try {
    const organizationId = req.user.organization.id;
    const { name, description, date, type, recurring } = req.body;

    const existing = await prisma.holiday.findFirst({
      where: { organizationId, name, date: new Date(date) },
    });
    if (existing)
      return res.status(400).json({
        message: "Holiday with the same name and date already exists.",
      });

    const holiday = await prisma.holiday.create({
      data: {
        organizationId,
        name,
        description,
        date: new Date(date),
        type,
        recurring,
      },
    });

    res.status(201).json({
      message: "Holiday created successfully.",
      data: holiday,
    });
  } catch (error) {
    console.error("❌ createHoliday error:", error);
    res.status(500).json({ message: "Failed to create holiday." });
  }
};

export const updateHoliday = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.params;

    const { name, description, date, type, recurring } = req.body;

    const holiday = await prisma.holiday.findFirst({
      where: { id, organizationId },
    });
    if (!holiday)
      return res.status(404).json({ message: "Holiday not found." });

    const updated = await prisma.holiday.update({
      where: { id },
      data: {
        name: name ?? holiday.name,
        description: description ?? holiday.description,
        date: date ? new Date(date) : holiday.date,
        type: type ?? holiday.type,
        recurring: recurring ?? holiday.recurring,
      },
    });

    res.status(200).json({
      message: "Holiday updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("❌ updateHoliday error:", error);
    res.status(500).json({ message: "Failed to update holiday." });
  }
};

export const deleteHoliday = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.params;

    const holiday = await prisma.holiday.findFirst({
      where: { id, organizationId },
    });

    if (!holiday)
      return res.status(404).json({ message: "Holiday not found." });

    await prisma.holiday.delete({ where: { id } });

    res.status(200).json({ message: "Holiday deleted successfully." });
  } catch (error) {
    console.error("❌ deleteHoliday error:", error);
    res.status(500).json({ message: "Failed to delete holiday." });
  }
};
