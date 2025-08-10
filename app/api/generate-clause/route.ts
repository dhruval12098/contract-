import { type NextRequest, NextResponse } from "next/server"
import { generateClauseDescription } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { title, contractType, projectTitle } = await request.json()

    if (!title || !contractType) {
      return NextResponse.json({ error: "Title and contract type are required" }, { status: 400 })
    }

    const description = await generateClauseDescription(title, contractType, projectTitle)

    return NextResponse.json({ description })
  } catch (error) {
    console.error("Error in generate-clause API:", error)
    return NextResponse.json({ error: "Failed to generate clause description" }, { status: 500 })
  }
}
