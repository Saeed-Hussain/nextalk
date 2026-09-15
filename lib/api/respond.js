import { NextResponse } from "next/server";

// Mirrors the original Express sendResponse() shape so nothing on the
// frontend has to change its expectations: { success, message, data }.
export function respond(status, message, data = null) {
  return NextResponse.json(
    { success: status >= 200 && status < 300, message, data },
    { status }
  );
}
