import axios from 'axios'

function transformData(values) {
  const [headers, ...rows] = values

  return rows.map(row => {
    const obj = {}

    headers.forEach((h, i) => {
      obj[h] = row[i] || ""
    })

    return obj
  })
}

const sheetsData = async () => {
  try {
    const key = import.meta.env.VITE_SHEETS_API_KEY
    const id  = import.meta.env.VITE_SHEET_ID
    const res = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/A1:Z1000?key=${key}`
    )
    return transformData(res.data.values)
  } catch (err) {
    console.error("Erro:", err)
    return []
  }
}

export default sheetsData