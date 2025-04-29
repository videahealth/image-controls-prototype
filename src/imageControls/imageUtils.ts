/**
 * Scaling to unity is important because it normalizes the image data to a
 * consistent range (0-1) regardless of the original bit depth (8-bit, 12-bit,
 * or 16-bit). This ensures consistent behavior across different types of
 * medical images.
 *
 * @param imageArray - The image data as a Uint8ClampedArray
 * @returns A new Uint8ClampedArray with the scaled image data
 */
export const scaleToUnity = (
  imageArray: Uint8ClampedArray
): Uint8ClampedArray => {
  // Find max value efficiently without using spread operator
  let maxValue = 0;
  for (let i = 0; i < imageArray.length; i++) {
    if (imageArray[i] > maxValue) {
      maxValue = imageArray[i];
    }
  }

  // Handle case where maxValue is 0 to avoid division by zero
  if (maxValue === 0) {
    return imageArray;
  }

  // Create new array with scaled values
  const scaledArray = new Uint8ClampedArray(imageArray.length);
  for (let i = 0; i < imageArray.length; i++) {
    scaledArray[i] = Math.round((imageArray[i] / maxValue) * 255);
  }

  return scaledArray;
};

export const convertToGrayscale = (imageArray: Uint8ClampedArray): number[] => {
  const grayscale: number[] = [];
  // Convert RGBA to grayscale using the standard formula: 0.299R + 0.587G + 0.114B
  for (let i = 0; i < imageArray.length; i += 4) {
    const r = imageArray[i];
    const g = imageArray[i + 1];
    const b = imageArray[i + 2];
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    grayscale.push(gray);
  }
  return grayscale;
};
