import { scaleToUnity, convertToGrayscale } from "./imageUtils.ts";

export const executeHistogramStretching = (
  imageArray: Uint8ClampedArray,
  parameters: Record<string, any> // Unused but kept to match ML app's signature
): Uint8ClampedArray => {
  // First scale to unity
  const scaledArray = scaleToUnity(imageArray);

  // Convert to grayscale
  const grayscale = convertToGrayscale(scaledArray);

  // Find min and max values
  let minValue = 255;
  let maxValue = 0;
  for (let i = 0; i < grayscale.length; i++) {
    if (grayscale[i] < minValue) minValue = grayscale[i];
    if (grayscale[i] > maxValue) maxValue = grayscale[i];
  }

  // Handle case where all values are the same
  if (minValue === maxValue) {
    return scaledArray;
  }

  // Create a new array to store the stretched values
  const stretchedArray = new Uint8ClampedArray(imageArray.length);

  // Apply stretching to each pixel while preserving alpha
  for (let i = 0; i < imageArray.length; i += 4) {
    // Get grayscale value for this pixel
    const grayIndex = i / 4;
    const gray = grayscale[grayIndex];

    // Apply min-max stretching
    const stretchedGray = Math.round(
      ((gray - minValue) / (maxValue - minValue)) * 255
    );

    // Set RGB channels to the same stretched grayscale value
    stretchedArray[i] = stretchedGray; // R
    stretchedArray[i + 1] = stretchedGray; // G
    stretchedArray[i + 2] = stretchedGray; // B
    stretchedArray[i + 3] = scaledArray[i + 3]; // A
  }

  // Log first 5 pixels (20 values) for comparison
  const firstPixels = Array.from(scaledArray.slice(0, 20));
  const firstPixelsStretched = Array.from(stretchedArray.slice(0, 20));

  console.log({
    stretchedArray: firstPixelsStretched,
    stretchedArrayLength: stretchedArray.length,
    imageArray: firstPixels,
    minValue,
    maxValue,
  });

  return stretchedArray;
};
