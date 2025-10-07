import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'

dotenv.config()
const app = express()
app.use(bodyParser.json())

const sessions = {}

function buildSystemPrompt(lang = 'en') {
  if (lang === 'hi') {
    return `You are RedBot — a short, empathetic Hindi assistant for menstrual health. Provide non-diagnostic general info, encourage medical consultation for severe issues, and give crisis resources if user expresses self-harm.`
  }
  return `You are RedBot — a short, empathetic assistant for menstrual health. Provide non-diagnostic general info, encourage medical consultation for severe issues, and give crisis resources if user expresses self-harm.`
}

app.post('/api/chat', async (req, res) => {
  const { message, lang = 'en', sessionId } = req.body
  if (!message) return res.status(400).json({ error: 'No message' })

  const lower = message.toLowerCase()
  if (/(suicide|kill myself|i can't go on|end my life|self harm|cut myself|dont want)/i.test(lower)) {
    const crisisText = lang === 'hi' ? 'मुझे खेद है कि आप ऐसा महसूस कर रहे हैं। अगर आप तुरंत खतरे में हैं, तो कृपया अपने स्थानीय आपातकालीन नंबर पर कॉल करें या किसी भरोसेमंद व्यक्ति से संपर्क करें। भारत के लिए: नेशनल सुसाइड हेल्पलाइन — 9152987821। क्या मैं और मदद कर सकूँ?' : 'I\'m sorry you\'re feeling this way. If you are in immediate danger, please call your local emergency number or contact someone you trust. US example: National Suicide & Crisis Lifeline — dial or text 988. Would you like more help finding local resources?'
    return res.json({ messages: [{ role: 'bot', text: crisisText }] })
  }

  sessions[sessionId] = sessions[sessionId] || []
  sessions[sessionId].push({ role: 'user', content: message })

  const systemPrompt = buildSystemPrompt(lang)

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...sessions[sessionId].slice(-6).map((m) => ({ role: 'user', content: m.content }))
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    })

    if (!openaiRes.ok) {
      const txt = await openaiRes.text()
      console.error('OpenAI error:', txt)
      return res.status(500).json({ error: 'Provider error' })
    }

    const openaiJson = await openaiRes.json()
    const botText = openaiJson.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response."
    sessions[sessionId].push({ role: 'bot', content: botText })
    return res.json({ messages: [{ role: 'bot', text: botText }] })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ messages: [{ role: 'bot', text: 'Server error. Try again later.' }] })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`RedBot server running on ${PORT}`))
