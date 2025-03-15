"use client"

import { useEffect, useState } from "react"
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
import { toast } from "sonner"
import { CircleHelp, Pencil, Plus, Save, Trash2 } from "lucide-react"
import { AVAILABLE_PROPERTIES, getConsts } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useStore } from "../cartographer"

export default function EditorForm({ feature, draw, setPopup, mapName }) {
  const { editorTable, setEditorTable } = useStore()
  const [isAddingRow, setIsAddingRow] = useState(false)
  const { TYPES } = getConsts(mapName)
  const [newRow, setNewRow] = useState({
    key: "",
    value: "",
  })
  const availableTypes = Object.keys(TYPES).filter(t =>
    feature.geometry.type.toLowerCase() === t.split(".")[1]
  ).map(t => t.split(".")[0])

  function handleInputChange(e) {
    setNewRow((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function deleteRow(index) {
    if (!draw) return
    const newProperties = { ...feature.properties }
    const keyToDelete = Object.keys(newProperties)[index]
    delete newProperties[keyToDelete]
    const latestFeature = draw.get(feature.id)
    const newFeature = { ...latestFeature, properties: newProperties }
    draw.add(newFeature)
    setPopup(newFeature)
  }

  function handleSave() {
    if (isAddingRow) {
      if (!newRow.key || !newRow.value || !draw) {
        setIsAddingRow(false)
        return
      }
      const latestFeature = draw.get(feature.id)
      const keyExists = Object.keys(feature.properties).includes(newRow.key);
      if (keyExists) {
        toast.warning(`"${newRow.key}" Key already exists`)
        return
      }
      const newFeature = { ...latestFeature, properties: { ...feature.properties, [newRow.key]: newRow.value } }
      draw.add(newFeature)
      setPopup(newFeature)
      // Reset the form
      setNewRow({
        key: "",
        value: "",
      })

      // Switch back to "Add Row" mode
      setIsAddingRow(false)
    } else {
      setEditorTable(null)
    }
  }

  function handleEdit() {
    setEditorTable(feature.properties)
  }

  function editProp(newVal, key) {
    const newProperties = { ...feature.properties }
    newProperties[key] = newVal
    const latestFeature = draw.get(feature.id)
    const newFeature = { ...latestFeature, properties: newProperties }
    draw.add(newFeature)
    setPopup(newFeature)
    setEditorTable(newFeature.properties)
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
          {editorTable && (
            Object.entries(feature.properties).map((arr, i) => {
              return (
                <TableRow key={i} >
                  <TableCell className="font-medium">{arr[0]}</TableCell>
                  <TableCell>
                    {arr[0] === "type"
                      ? <Select onValueChange={e => editProp(e, arr[0])} defaultValue={editorTable[arr[0]]}>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTypes.map((type, index) => (
                            <SelectItem key={index} value={type} className="cursor-pointer">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select >
                      : <Input value={editorTable[arr[0]]} onChange={e => editProp(e.target.value, arr[0])} className="h-8"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSave()
                          }
                        }}
                      />
                    }
                  </TableCell>
                </TableRow>
              )
            })
          )}
          {!editorTable && (
            Object.entries(feature.properties).map((arr, i) => (
              <TableRow key={i} >
                <TableCell className="font-medium">{arr[0]}</TableCell>
                {arr[1].startsWith("http") &&
                  <TableCell>
                    <svg width="20" height="20">
                      <image href={arr[1]} width="20" height="20" />
                    </svg>
                  </TableCell>
                }
                {arr[1].startsWith("rgba") &&
                  <TableCell>
                    <div style={{ width: '20px', height: '20px', backgroundColor: arr[1] }}></div>
                  </TableCell>
                }
                {(!arr[1].startsWith("rgba") && !arr[1].startsWith("http")) && <TableCell>{arr[1]}</TableCell>}

                <TableCell>
                  <Dialog className="">
                    <DialogTrigger>
                      {arr[0] !== "type" && arr[0] !== "name" && (
                        <Trash2 className="cursor-pointer stroke-gray-400" size={14} />
                      )}
                    </DialogTrigger>
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
            ))
          )}
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
                      handleSave()
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
                      handleSave()
                    }
                  }}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Dialog>
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
        </DialogContent>
      </Dialog>
      {(!isAddingRow && !editorTable) ?
        <>
          <Button size="sm" onClick={() => setIsAddingRow(true)} className="cursor-pointer w-full h-[30px] mb-2" variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            Add Data
          </Button>
          <Button size="sm" onClick={handleEdit} className="cursor-pointer w-full h-[30px]" variant="secondary">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Data
          </Button>
        </>
        :
        <Button size="sm" onClick={handleSave} className="cursor-pointer w-full h-[30px]">
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      }
    </div >
  )
}
