import { NextResponse } from "next/server";
import { contactSchema, sendContactNotification } from "@/lib/contact";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = contactSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission. Please check your fields and try again." },
        { status: 400 },
      );
    }

    await sendContactNotification(parsed.data);
    return NextResponse.json({ message: "Thanks, your inquiry has been sent." }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    const status = message.startsWith("Missing required env var") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
