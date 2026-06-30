import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const CONFIG_FILE = path.join(process.cwd(), "prisma", "system_config.json");

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading system config file:", error);
  }
  return {
    systemName: "Mandil Farmhouse",
    logoUrl: "/boat-safari.png",
    themeColor: "emerald",
  };
}

function writeConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing system config file:", error);
    return false;
  }
}

export async function GET() {
  const config = readConfig();
  return NextResponse.json({ success: true, config });
}

export async function POST(request: Request) {
  try {
    const { systemName, logoUrl, themeColor } = await request.json();
    const current = readConfig();
    const updated = {
      systemName: systemName || current.systemName,
      logoUrl: logoUrl || current.logoUrl,
      themeColor: themeColor || current.themeColor,
    };
    writeConfig(updated);
    return NextResponse.json({ success: true, config: updated });
  } catch (error: any) {
    console.error("[POST /api/admin/config] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save configuration." },
      { status: 550 }
    );
  }
}
