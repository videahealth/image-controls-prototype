import { convertToGrayscale } from "./imageUtils.ts";

/**
 * Histogram stretching is a technique used to adjust the contrast of an image
 * by stretching the pixels to the full range of 0-255. Any pixels that were
 * clipped to the lower or upper bound in the previous step will be stretched to
 * the extreme values of 0 (pure black) and 255 (pure white), respectively. The
 * middle pixels will be stretched across the rest of the range.
 *
 * @param clippedArray - The image data as a Uint8ClampedArray
 * @returns A new Uint8ClampedArray with the stretched image data
 */
export const executeHistogramStretching = (
  clippedArray: Uint8ClampedArray
): Uint8ClampedArray => {
  // Create a new array to store the stretched values
  const stretchedArray = new Uint8ClampedArray(clippedArray.length);

  // Convert to grayscale
  const clippedGrayscale = convertToGrayscale(clippedArray);

  // Find min and max values in the clipped grayscale array
  let minValue = 255;
  let maxValue = 0;
  for (let i = 0; i < clippedGrayscale.length; i++) {
    if (clippedGrayscale[i] < minValue) minValue = clippedGrayscale[i];
    if (clippedGrayscale[i] > maxValue) maxValue = clippedGrayscale[i];
  }

  // Calculate the range for stretching
  const range = maxValue - minValue;

  // Apply histogram stretching
  for (let i = 0; i < clippedArray.length; i += 4) {
    const grayIndex = i / 4;
    const grayValue = clippedGrayscale[grayIndex];

    // Stretch the value to [0, 255] range
    const stretchedGray =
      range === 0 ? 0 : Math.round(((grayValue - minValue) / range) * 255);

    // Set RGB channels to the same stretched grayscale value while preserving alpha
    stretchedArray[i] = stretchedGray; // R
    stretchedArray[i + 1] = stretchedGray; // G
    stretchedArray[i + 2] = stretchedGray; // B
    stretchedArray[i + 3] = clippedArray[i + 3]; // A
  }

  return stretchedArray;
};
