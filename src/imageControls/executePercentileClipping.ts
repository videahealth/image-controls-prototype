import { quantile } from "d3-array";

const scaleToUnity = (imageArray: Uint8ClampedArray): Uint8ClampedArray => {
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

const convertToGrayscale = (imageArray: Uint8ClampedArray): number[] => {
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

export const executePercentileClipping = (
  imageArray: Uint8ClampedArray,
  parameters: { lowerBound: number; upperBound: number }
): Uint8ClampedArray => {
  // First scale to unity
  const scaledArray = scaleToUnity(imageArray);

  // Convert to grayscale
  const grayscale = convertToGrayscale(scaledArray);

  // Normalize to 0-1 range
  const normalizedGrayscale = grayscale.map((v) => v / 255);

  // Calculate quantiles on normalized grayscale values
  const lowerQuantile = quantile(
    normalizedGrayscale,
    parameters.lowerBound / 100
  );
  const upperQuantile = quantile(
    normalizedGrayscale,
    parameters.upperBound / 100
  );

  // Create a new array to store the clipped values
  const clippedArray = new Uint8ClampedArray(imageArray.length);

  // Apply clipping to each pixel while preserving alpha
  for (let i = 0; i < imageArray.length; i += 4) {
    // Get grayscale value for this pixel
    const grayIndex = i / 4;
    const normalizedGray = normalizedGrayscale[grayIndex];

    // Apply clipping in normalized space
    const clippedGray = Math.round(
      Math.min(Math.max(normalizedGray, lowerQuantile), upperQuantile) * 255
    );

    // Set RGB channels to the same clipped grayscale value
    clippedArray[i] = clippedGray; // R
    clippedArray[i + 1] = clippedGray; // G
    clippedArray[i + 2] = clippedGray; // B
    clippedArray[i + 3] = scaledArray[i + 3]; // A
  }

  // Log first 5 pixels (20 values) for comparison
  const firstPixels = Array.from(scaledArray.slice(0, 20));
  const firstPixelsNormalized = firstPixels.map((v, i) =>
    i % 4 === 3 ? 1 : v / 255
  );
  const firstPixelsClipped = Array.from(clippedArray.slice(0, 20));

  console.log({
    clippedArray: firstPixelsClipped,
    clippedArrayLength: clippedArray.length,
    imageArray: firstPixels,
    lowerBound: parameters.lowerBound,
    lowerQuantile,
    normalizedArray: firstPixelsNormalized,
    upperBound: parameters.upperBound,
    upperQuantile,
  });

  return clippedArray;
};
