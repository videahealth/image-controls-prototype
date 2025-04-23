import { quantile } from "d3-array";

interface PercentileClippingParams {
  lowerBound: number;
  upperBound: number;
}

/**
 * Applies percentile clipping to an image array
 * @param imageArray - The image data array (RGBA format)
 * @param params - Parameters containing lower and upper bound percentiles
 * @returns The clipped image array
 */
export const executePercentileClipping = (
  imageArray: Uint8ClampedArray,
  params: PercentileClippingParams
): Uint8ClampedArray => {
  // Extract RGB channels (skip alpha channel)
  const rgbChannels: number[] = [];
  for (let i = 0; i < imageArray.length; i += 4) {
    rgbChannels.push(imageArray[i]); // R
    rgbChannels.push(imageArray[i + 1]); // G
    rgbChannels.push(imageArray[i + 2]); // B
  }

  // Calculate quantiles for the specified percentiles
  const lowerQuantile = quantile(rgbChannels, params.lowerBound / 100);
  const upperQuantile = quantile(rgbChannels, params.upperBound / 100);

  // Create a new array to store the clipped values
  const clippedArray = new Uint8ClampedArray(imageArray.length);

  // Apply clipping to each channel while preserving alpha
  for (let i = 0; i < imageArray.length; i += 4) {
    clippedArray[i] = Math.min(
      Math.max(imageArray[i], lowerQuantile),
      upperQuantile
    ); // R
    clippedArray[i + 1] = Math.min(
      Math.max(imageArray[i + 1], lowerQuantile),
      upperQuantile
    ); // G
    clippedArray[i + 2] = Math.min(
      Math.max(imageArray[i + 2], lowerQuantile),
      upperQuantile
    ); // B
    clippedArray[i + 3] = imageArray[i + 3]; // A
  }

  console.log({
    imageArray: imageArray.slice(0, 20),
    clippedArray: clippedArray.slice(0, 20),
    lowerQuantile,
    upperQuantile,
    lowerBound: params.lowerBound,
    upperBound: params.upperBound,
  });

  return clippedArray;
};
