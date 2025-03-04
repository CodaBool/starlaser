"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CircleHelp, Plus, Save, Trash2 } from "lucide-react"
import { AVAILABLE_PROPERTIES } from "@/lib/utils"

export default function TableForm({ feature, draw, setPopup }) {
  const [isAddingRow, setIsAddingRow] = useState(false)
  const [newRow, setNewRow] = useState({
    key: "",
    value: "",
  })

  function handleInputChange(e) {
    setNewRow((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function deleteRow(index) {
    if (!draw) return
    const newProperties = { ...feature.properties }
    const keyToDelete = Object.keys(newProperties)[index]
    delete newProperties[keyToDelete]
    const newFeature = { ...feature, properties: newProperties }
    draw.add(newFeature)
    setPopup(newFeature)
  }

  function handleSaveRow() {
    if (!newRow.key || !newRow.value || !draw) {
      setIsAddingRow(false)
      return
    }
    const newFeature = { ...feature, properties: { ...feature.properties, [newRow.key]: newRow.value } }
    draw.add(newFeature)
    setPopup(newFeature)
    // Reset the form
    setNewRow({
      key: "",
      value: "",
    })

    // Switch back to "Add Row" mode
    setIsAddingRow(false)
  }

  return (
    <div className="space-y-4 font-mono select-text">
      <Table>
        <TableHeader>
          <TableRow className="text-center">
            <TableHead className="text-center">Key</TableHead>
            <TableHead className="text-center">Value</TableHead>
            <TableHead className="text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(feature.properties).map((arr, i) => (
            <TableRow key={i} >
              <TableCell className="font-medium">{arr[0]}</TableCell>
              <TableCell>{arr[1]}</TableCell>
              <TableCell>
                <Dialog className="">
                  <DialogTrigger><Trash2 className="cursor-pointer stroke-gray-400" size={14} /></DialogTrigger>
                  <DialogContent className="max-h-[600px] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>Confirm <b>delete</b> row <b>{arr[0]}</b>?</DialogTitle>
                      <table className="w-full text-left my-4 select-text ">
                        <tbody>
                          <tr>
                            <td className="border p-2">{arr[0]}</td>
                            <td className="border p-2">{arr[1]}</td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="flex justify-between">
                        <Button variant="destructive" onClick={() => deleteRow(i)} className="cursor-pointer rounded">
                          Delete
                        </Button>
                        <DialogClose asChild>
                          <Button variant="secondary" className="cursor-pointer rounded">
                            Cancel
                          </Button>
                        </DialogClose>
                      </div>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
          {isAddingRow && (
            <TableRow>
              <TableCell>
                <Input
                  name="key"
                  value={newRow.key}
                  onChange={handleInputChange}
                  placeholder="key"
                  className="h-8"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveRow()
                    }
                  }}
                />
              </TableCell>
              <TableCell>
                <Input
                  name="value"
                  value={newRow.value}
                  onChange={handleInputChange}
                  placeholder="value"
                  className="h-8"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveRow()
                    }
                  }}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Dialog>
        {/* <DialogTrigger asChild>
          <Button variant="secondary" className="cursor-pointer rounded">
            Cancel
          </Button>
        </DialogClose> */}
        <DialogTrigger asChild >
          <Button size="sm" className="cursor-pointer w-full h-[30px] mb-2" variant="secondary">
            <CircleHelp className="cursor-pointer stroke-gray-400 inline" size={14} /> Special Keys
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>Special Properties</DialogTitle>
            <DialogDescription>
              The keys below have special impact on the map
            </DialogDescription>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow className="text-center">
                <TableHead className="">Key</TableHead>
                <TableHead className="text-center">Effect</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Required</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Object.entries(AVAILABLE_PROPERTIES).map((obj, i) => (
                <TableRow key={i}>
                  <TableCell className="">{obj[0]}</TableCell>
                  <TableCell>
                    <div dangerouslySetInnerHTML={{ __html: obj[1].split("|")[0] }} />
                  </TableCell>
                  <TableCell className="text-center">{obj[1].split("|type=")[1]}</TableCell>
                  {obj[1].includes("|required") && <TableCell title="this field is required" className="cursor-help text-center">🚩</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* <table className="w-full text-left my-4">
            <tbody>
              {Object.entries(AVAILABLE_PROPERTIES).map((obj, i) => {
                return (
                  <TableRow key={i}>
                    <TableCell className="border p-2">{obj[0]}</TableCell>
                    <TableCell className="border p-2">{obj[1].split("|")[0]}</TableCell>
                    <TableCell className="border p-2">
                      {obj[0] === "icon" ? "hi" : obj[0] === "name" || obj[0] === "type" ? "required" : ""}
                    </TableCell>
                  </TableRow>
                )
              })}
            </tbody>
          </table> */}
        </DialogContent>
      </Dialog>
      <div className="flex justify-end">
        {!isAddingRow ? (
          <Button size="sm" onClick={() => setIsAddingRow(true)} className="cursor-pointer w-full h-[30px]" variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            Add Data
          </Button>
        ) : (
          <Button size="sm" onClick={handleSaveRow} className="cursor-pointer w-full h-[30px]">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        )}
      </div>
    </div >
  )
}
