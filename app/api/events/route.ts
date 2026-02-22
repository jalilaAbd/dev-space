import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

export async function POST(request: NextRequest) {
  console.log("ENV TEST:", process.env.MONGODB_URI);
  try {
    await connectDB(); // Ensure database connection is established
    const formData = await request.formData(); // Parse form data from the request
    let event;
    try {
      // Fallback to parsing form data if JSON parsing fails
      event = Object.fromEntries(formData.entries());
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid JSON format or form data parsing error" },
        { status: 400 },
      );
    }

    const createdEvent = await Event.create(event);
    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      {
        message: "An error occurred while creating the event",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
