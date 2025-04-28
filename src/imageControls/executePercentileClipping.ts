import { quantile } from "d3-array";
import { scaleToUnity, convertToGrayscale } from "./imageUtils.ts";

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
    let clippedGray: number;
    if (lowerQuantile && normalizedGray < lowerQuantile) {
      clippedGray = Math.round(lowerQuantile * 255); // Clip to lower percentile value
    } else if (upperQuantile && normalizedGray > upperQuantile) {
      clippedGray = Math.round(upperQuantile * 255); // Clip to upper percentile value
    } else {
      clippedGray = grayscale[grayIndex]; // Keep original value
    }

    // Set RGB channels to the same clipped grayscale value
    clippedArray[i] = clippedGray; // R
    clippedArray[i + 1] = clippedGray; // G
    clippedArray[i + 2] = clippedGray; // B
    clippedArray[i + 3] = scaledArray[i + 3]; // A
  }

  return clippedArray;
};
