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
    const res = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/1C0PGRoDWGPG3plXLjx_NlBo-R7JHgwEpadRpju4T_bI/values/A1:Z1000?key=AIzaSyCdrCiWXDXIRWGW4kmnJz1q4p0Yo7iUJpA`
    )

    const data = transformData(res.data.values)

    return data

  } catch (err) {
    console.error("Erro:", err)
    return []
  }
}

export default sheetsData

