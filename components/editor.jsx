import { useState } from "react"
import { Button } from './ui/button'

export default function FeaturePopup({ feature, onSave, onClose }) {
  // Convert feature properties from an object to an array of { key, value } pairs
  const initialRows = Object.entries(feature.properties || {}).map(([key, value]) => ({ key, value }));
  const [rows, setRows] = useState(initialRows)

  // Update a row's key or value
  const handleChange = (index, field, newValue) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: newValue };
    setRows(newRows);
  }

  // Add a new empty row
  const addRow = () => {
    setRows([...rows, { key: '', value: '' }]);
  }

  // On save, convert the rows back into an object (ignoring rows with empty keys)
  const handleSave = () => {
    const newProps = {};
    rows.forEach(({ key, value }) => {
      if (key.trim()) {
        newProps[key] = value;
      }
    })
    onSave(feature.id, newProps);
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: '20px',
        bottom: '20px',
        background: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        zIndex: 100,
        color: "black",
      }}
    >
      <h4 className="text-xl mb-4 text-bold">Edit Feature</h4>
      <table>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td style={{ paddingRight: '5px' }}>
                <input
                  value={row.key}
                  placeholder="Property Key"
                  onChange={(e) => handleChange(index, 'key', e.target.value)}
                />
              </td>
              <td>
                <input
                  value={row.value}
                  placeholder="Property Value"
                  onChange={(e) => handleChange(index, 'value', e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button onClick={addRow} className="cursor-pointer">Add Row</Button>
      <Button onClick={handleSave} className="cursor-pointer">Save</Button>
      <Button onClick={onClose} className="cursor-pointer">Close</Button>
    </div>
  );
}
