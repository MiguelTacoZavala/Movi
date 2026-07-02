import { Search } from 'lucide-react'

export default function Table({ columns, data, emptyMessage = 'No hay datos disponibles' }) {
  return (
    <div className="table-container">
      {data.length === 0 ? (
        <div className="empty-state">
          <Search size={64} />
          <h3>No hay datos</h3>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} scope="col">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} style={{ animation: 'fadeInUp 0.3s ease both', animationDelay: `${rowIndex * 0.04}s` }}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
