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
    if (normalizedGray < lowerQuantile) {
      clippedGray = Math.round(lowerQuantile * 255); // Clip to lower percentile value
    } else if (normalizedGray > upperQuantile) {
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

  // Apply histogram stretching to the clipped values
  const stretchedArray = new Uint8ClampedArray(imageArray.length);
  const clippedGrayscale = convertToGrayscale(clippedArray);
  const clippedNormalized = clippedGrayscale.map((v) => v / 255);

  // Calculate new quantiles after clipping
  const clippedLowerQuantile = quantile(
    clippedNormalized,
    parameters.lowerBound / 100
  );
  const clippedUpperQuantile = quantile(
    clippedNormalized,
    parameters.upperBound / 100
  );

  // Apply histogram stretching
  for (let i = 0; i < imageArray.length; i += 4) {
    const grayIndex = i / 4;
    const normalizedGray = clippedNormalized[grayIndex];

    // Stretch values between the clipped percentiles to the full range
    let stretchedGray: number;
    if (normalizedGray <= clippedLowerQuantile) {
      stretchedGray = 0;
    } else if (normalizedGray >= clippedUpperQuantile) {
      stretchedGray = 255;
    } else {
      const range = clippedUpperQuantile - clippedLowerQuantile;
      const normalizedValue = (normalizedGray - clippedLowerQuantile) / range;
      stretchedGray = Math.round(normalizedValue * 255);
    }

    // Set RGB channels to the same stretched grayscale value
    stretchedArray[i] = stretchedGray; // R
    stretchedArray[i + 1] = stretchedGray; // G
    stretchedArray[i + 2] = stretchedGray; // B
    stretchedArray[i + 3] = clippedArray[i + 3]; // A
  }

  // Log first 5 pixels (20 values) for comparison
  const firstPixels = Array.from(scaledArray.slice(0, 20));
  const firstPixelsNormalized = firstPixels.map((v, i) =>
    i % 4 === 3 ? 1 : v / 255
  );
  const firstPixelsStretched = Array.from(stretchedArray.slice(0, 20));

  console.log({
    stretchedArray: firstPixelsStretched,
    stretchedArrayLength: stretchedArray.length,
    imageArray: firstPixels,
    lowerBound: parameters.lowerBound,
    lowerQuantile,
    clippedLowerQuantile,
    normalizedArray: firstPixelsNormalized,
    upperBound: parameters.upperBound,
    upperQuantile,
    clippedUpperQuantile,
  });

  return stretchedArray;
};
