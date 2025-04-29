import { quantile } from "d3-array";
import { scaleToUnity, convertToGrayscale } from "./imageUtils.ts";

/**
 * Percentile clipping is a technique used to adjust the contrast of an image by
 * clipping the darkest and brightest pixels to specific percentiles to improve
 * the visibility of subtle details.
 *
 * In our case, the user can choose to clip up to the 5th percentile, removing
 * the darkest 5% of pixels, and down to the 95th percentile, removing the
 * brightest 5% of pixels. All of the pixels outside of these bounds are clipped
 * to the nearest bound. Therefore, the range of the image is reduced.
 *
 * In the subsequent histogram stretching step, the image will be stretched back
 * to the full range of 0-255.
 *
 * @param imageArray - The image data as a Uint8ClampedArray
 * @param parameters - An object containing the lower and upper bounds for clipping
 * @returns A new Uint8ClampedArray with the clipped image data
 */
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
