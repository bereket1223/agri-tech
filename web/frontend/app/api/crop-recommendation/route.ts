import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execPromise = promisify(exec)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall } = body

    // Validate inputs
    if (!nitrogen || !phosphorus || !potassium || !temperature || !humidity || !ph || !rainfall) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // In a production environment, we would call the Python model
    // For demo purposes, we'll use a simplified logic to determine the crop

    let recommendedCrop = ""

    if (nitrogen > 80 && phosphorus > 40 && potassium > 40) {
      recommendedCrop = "Rice"
    } else if (nitrogen > 60 && temperature > 20) {
      recommendedCrop = "Maize"
    } else if (ph < 6) {
      recommendedCrop = "Cotton"
    } else {
      recommendedCrop = "Wheat"
    }

    return NextResponse.json({
      success: true,
      crop: recommendedCrop,
      message: `${recommendedCrop} is the best crop to be cultivated right there`,
    })

    // In a real implementation, we would call the Python model like this:
    /*
    // Create a temporary input file
    const tempInputFile = path.join(os.tmpdir(), 'crop_input.json');
    fs.writeFileSync(tempInputFile, JSON.stringify(body));
    
    // Call the Python script
    const { stdout, stderr } = await execPromise(`python predict_crop.py ${tempInputFile}`);
    
    if (stderr) {
      console.error('Error from Python script:', stderr);
      return NextResponse.json(
        { success: false, message: "Error processing request" },
        { status: 500 }
      );
    }
    
    // Parse the output from the Python script
    const result = JSON.parse(stdout);
    
    return NextResponse.json({ 
      success: true, 
      crop: result.crop,
      message: result.message
    });
    */
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ success: false, message: "Failed to process crop recommendation" }, { status: 500 })
  }
}

