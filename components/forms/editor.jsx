"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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
import { RgbaColorPicker } from "react-colorful"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { CircleHelp, Pencil, Plus, Save, Trash2 } from "lucide-react"
import { AVAILABLE_PROPERTIES, getConsts } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useStore } from "../cartographer"
import { getIcon } from "../map"

export default function EditorForm({ feature, draw, setPopup, mapName, popup }) {
  const { editorTable, setEditorTable } = useStore()
  const [isAddingRow, setIsAddingRow] = useState(false)
  const [stroke, setStroke] = useState(rgbaToObj(popup?.properties.stroke))
  const [fill, setFill] = useState(rgbaToObj(popup?.properties.fill))
  const [errorStroke, setErrorStroke] = useState()
  const [errorFill, setErrorFill] = useState()

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
      if (stroke) {
        editProp(objToRgba(stroke), "stroke")
      }
      if (fill) {
        editProp(objToRgba(fill), "fill")
      }
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

  // error messages
  useEffect(() => {
    if (popup.properties.fill !== objToRgba(fill)) {
      console.log("new popup and fill don't match", popup.properties.fill, "vs", objToRgba(fill))
      setFill(popup.properties.fill)
    }
    if (popup.properties.stroke !== objToRgba(stroke)) {
      console.log("new popup and stroke don't match", popup.properties.fill, "vs", objToRgba(stroke))
      setStroke(popup.properties.stroke)
    }
    if (feature.geometry.type === "Polygon" || feature.geometry.type === "Point") {
      if (!feature.properties.fill) {
        setErrorFill(true)
      } else {
        setErrorFill(null)
      }
    }
    if (feature.geometry.type === "LineString" || feature.geometry.type === "Polygon") {
      if (!feature.properties.stroke) {
        setErrorStroke(true)
      } else {
        setErrorStroke(null)
      }
    }
  }, [popup])

  // useEffect(() => {
  //   if (!stroke) return
  //   console.log("setting stroke", stroke)

  // }, [stroke])
  // useEffect(() => {
  //   if (!fill) return
  //   console.log("setting stroke", fill)
  //   editProp(objToRgba(fill), "fill")
  // }, [fill])

  useEffect(() => {
    setEditorTable(null)
  }, [])

  console.log("fill", feature.properties.fill, "stroke", feature.properties.stroke)

  return (
    <div className="space-y-4 font-mono select-text">
      {popup.geometry.type === 'Point' && (
        <div dangerouslySetInnerHTML={{ __html: getIcon(popup, objToRgba(fill)) }}></div>
      )}
      {popup.geometry.type === 'Polygon' && (
        <div className="popup-preview">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <rect x="4" y="4" width="19" height="19" fill={objToRgba(fill)} stroke={objToRgba(stroke)} strokeWidth="3" />
          </svg>
        </div>
      )}
      {popup.geometry.type === 'LineString' && (
        <div className="popup-preview">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <line x1="4" y1="4" x2="20" y2="20" stroke={objToRgba(stroke)} strokeWidth="2" />
          </svg>
        </div>
      )}
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
                <TableRow key={i}>
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
                      : (arr[0] === "stroke" || arr[0] === "fill")
                        ? arr[0] === "stroke"
                          ? <PopoverPicker color={stroke} onChange={setStroke} editProp={editProp} />
                          : <PopoverPicker color={fill} onChange={setFill} editProp={editProp} />
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
                    {arr[0] === "stroke"
                      ?
                      <div
                        className="swatch w-5 h-5 border border-white"
                        style={{ backgroundColor: objToRgba(stroke) }}
                      />
                      :
                      <div
                        className="swatch w-5 h-5 border border-white"
                        style={{ backgroundColor: objToRgba(fill) }}
                      />
                    }
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
      <div className="text-center m-1">
        {errorStroke && <p className="text-red-500">Missing 'stroke' color</p>}
        {errorFill && <p className="text-red-500">Missing 'fill' color</p>}
      </div>
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

// Simple always open version
// export const PopoverPicker = ({ color, onChange, editProp }) => {
//   const popover = useRef();
//   return (
//     <div className="popover" ref={popover}>
//       <RgbaColorPicker color={rgbaToObj(color)} onChange={onChange} />
//     </div>
//   );
// };

export const PopoverPicker = ({ color, onChange, editProp }) => {
  const popover = useRef();
  const [isOpen, toggle] = useState(false)
  const close = useCallback(() => toggle(false), []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popover.current && !popover.current.contains(event.target)) {
        close()
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popover, close]);

  return (
    <>
      {isOpen
        ? <div className="popover" ref={popover}>
          <RgbaColorPicker color={rgbaToObj(color)} onChange={onChange} />
        </div>
        : <div
          className="swatch w-5 h-5 cursor-pointer border border-white"
          style={{ backgroundColor: objToRgba(color) }}
          onClick={() => toggle(true)}
        />
      }
    </>
  );
};

const rgbaToObj = (rgba) => {
  if (!rgba) return
  if (typeof rgba === "object") return rgba
  const rgbaRegex = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d*\.?\d+)\s*\)/;
  const result = rgba?.match(rgbaRegex);
  // const result = rgba?.match(/rgba?\((\d+), (\d+), (\d+), (\d+\.?\d*)\)/);
  // console.log("result", result, rgba)
  return result ? {
    r: parseInt(result[1], 10),
    g: parseInt(result[2], 10),
    b: parseInt(result[3], 10),
    a: parseFloat(result[4])
  } : undefined;
}

const objToRgba = (rgba) => {
  if (!rgba) return
  if (typeof rgba !== "object") return rgba
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
};
