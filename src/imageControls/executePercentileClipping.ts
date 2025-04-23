import { quantile } from "d3-array";

// TODO: Move scaleToUnity to own function to copy ML as closely as possible
// TODO: Should we convert to grayscale before calculating percentiles?

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

export const executePercentileClipping = (
  imageArray: Uint8ClampedArray,
  parameters: { lowerBound: number; upperBound: number }
): Uint8ClampedArray => {
  // First scale to unity
  const scaledArray = scaleToUnity(imageArray);

  // Extract RGB channels (skip alpha channel) and normalize to 0-1 range
  const rgbChannels: number[] = [];
  for (let i = 0; i < scaledArray.length; i += 4) {
    rgbChannels.push(scaledArray[i] / 255); // R
    rgbChannels.push(scaledArray[i + 1] / 255); // G
    rgbChannels.push(scaledArray[i + 2] / 255); // B
  }

  // Calculate quantiles on normalized RGB channels
  const lowerQuantile = quantile(rgbChannels, parameters.lowerBound / 100);
  const upperQuantile = quantile(rgbChannels, parameters.upperBound / 100);

  // Create a new array to store the clipped values
  const clippedArray = new Uint8ClampedArray(scaledArray.length);

  // Apply clipping to each channel while preserving alpha
  for (let i = 0; i < scaledArray.length; i += 4) {
    // Normalize current pixel values
    const r = scaledArray[i] / 255;
    const g = scaledArray[i + 1] / 255;
    const b = scaledArray[i + 2] / 255;

    // Apply clipping in normalized space
    clippedArray[i] = Math.round(
      Math.min(Math.max(r, lowerQuantile), upperQuantile) * 255
    ); // R
    clippedArray[i + 1] = Math.round(
      Math.min(Math.max(g, lowerQuantile), upperQuantile) * 255
    ); // G
    clippedArray[i + 2] = Math.round(
      Math.min(Math.max(b, lowerQuantile), upperQuantile) * 255
    ); // B
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
