import { spawn } from "child_process"
import path from "path"
import fs from "fs"
import os from "os"

// This utility function helps integrate with the Python model
export async function predictCrop(inputs: {
  nitrogen: number
  phosphorus: number
  potassium: number
  temperature: number
  humidity: number
  ph: number
  rainfall: number
}): Promise<{ crop: string; message: string }> {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary input file
      const tempDir = os.tmpdir()
      const inputFile = path.join(tempDir, "crop_input.json")
      fs.writeFileSync(inputFile, JSON.stringify(inputs))

      // Path to the Python script
      const scriptPath = path.join(process.cwd(), "scripts", "predict_crop.py")

      // Spawn Python process
      const pythonProcess = spawn("python", [scriptPath, inputFile])

      let result = ""
      let error = ""

      // Collect data from stdout
      pythonProcess.stdout.on("data", (data) => {
        result += data.toString()
      })

      // Collect errors from stderr
      pythonProcess.stderr.on("data", (data) => {
        error += data.toString()
      })

      // Handle process completion
      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${error}`))
          return
        }

        try {
          const parsedResult = JSON.parse(result)
          resolve(parsedResult)
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${e}`))
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}

// Function to process CSV file for bulk analysis
export async function processCsvFile(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      // Path to the Python script
      const scriptPath = path.join(process.cwd(), "scripts", "process_csv.py")

      // Spawn Python process
      const pythonProcess = spawn("python", [scriptPath, filePath])

      let result = ""
      let error = ""

      // Collect data from stdout
      pythonProcess.stdout.on("data", (data) => {
        result += data.toString()
      })

      // Collect errors from stderr
      pythonProcess.stderr.on("data", (data) => {
        error += data.toString()
      })

      // Handle process completion
      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${error}`))
          return
        }

        try {
          const parsedResult = JSON.parse(result)
          resolve(parsedResult)
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${e}`))
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}

