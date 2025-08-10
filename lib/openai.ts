import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateClauseDescription(title: string, contractType: "client" | "hiring", projectTitle: string): Promise<string> {
  try {
    const prompt = `Generate a professional legal clause description for a ${contractType} contract. 
    
Clause Title: "${title}"
Contract Type: ${contractType === "client" ? projectTitle : "Employment Contract"}

Requirements:
- Write in clear, professional legal language
- Make it specific to ${contractType === "client" ? `client ${projectTitle.toLowerCase()}s` : "employment contracts"}
- Include relevant terms and conditions
- Keep it concise but comprehensive (2-4 sentences)
- Focus on protecting both parties

Generate only the clause description, no additional text:`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a legal expert specializing in contract law. Generate professional, legally sound clause descriptions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content?.trim() || "Unable to generate description. Please write manually."
  } catch (error) {
    console.error("Error generating clause description:", error)
    return "AI generation unavailable. Please write the description manually."
  }
}
